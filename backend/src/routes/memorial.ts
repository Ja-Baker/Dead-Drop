import { Router, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { memorialRateLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const reactSchema = z.object({
  body: z.object({
    reaction: z.enum(['💀', '😭', '🕊️', '😂']),
  }),
  params: z.object({
    vaultId: z.string().uuid('Invalid vault ID'),
  }),
});

const commentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
    parentCommentId: z.string().uuid().optional(),
  }),
  params: z.object({
    vaultId: z.string().uuid('Invalid vault ID'),
  }),
});

// GET /api/memorial/:vaultId
router.get(
  '/:vaultId',
  memorialRateLimiter,
  optionalAuth,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { vaultId } = req.params;

      // Get vault
      const vaultResult = await query(
        'SELECT * FROM vaults WHERE id = $1',
        [vaultId]
      );

      if (vaultResult.rows.length === 0) {
        throw new AppError('Vault not found', 404);
      }

      const vault = vaultResult.rows[0];

      // Check if vault is public or user has access
      if (!vault.is_public) {
        // Check if user is owner or executor
        if (!req.userId) {
          throw new AppError('Vault is private', 403);
        }

        const accessResult = await query(
          `SELECT 1 FROM vaults WHERE id = $1 AND user_id = $2
           UNION
           SELECT 1 FROM vault_executors ve
           JOIN executors e ON e.id = ve.executor_id
           WHERE ve.vault_id = $1 AND e.email = (SELECT email FROM users WHERE id = $2)`,
          [vaultId, req.userId]
        );

        if (accessResult.rows.length === 0) {
          throw new AppError('Access denied', 403);
        }
      }

      // Get content
      const contentResult = await query(
        `SELECT 
          c.id,
          c.type,
          c.file_path,
          c.metadata,
          c.display_order,
          c.created_at
        FROM content c
        WHERE c.vault_id = $1
        ORDER BY c.display_order, c.created_at`,
        [vaultId]
      );

      // Get reactions
      const reactionsResult = await query(
        `SELECT reaction, COUNT(*) as count
         FROM memorial_reactions
         WHERE vault_id = $1
         GROUP BY reaction`,
        [vaultId]
      );

      // Get comments
      const commentsResult = await query(
        `SELECT 
          c.id,
          c.content,
          c.parent_comment_id,
          c.created_at,
          c.updated_at,
          u.email as user_email,
          e.email as executor_email
        FROM memorial_comments c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN executors e ON e.id = c.executor_id
        WHERE c.vault_id = $1
        ORDER BY c.created_at ASC`,
        [vaultId]
      );

      res.json({
        vault: {
          id: vault.id,
          name: vault.name,
          icon: vault.icon,
          description: vault.description,
          isPublic: vault.is_public,
          customSlug: vault.custom_slug,
        },
        content: contentResult.rows.map((c: any) => ({
          id: c.id,
          type: c.type,
          filePath: c.file_path,
          metadata: c.metadata,
          displayOrder: c.display_order,
          createdAt: c.created_at,
        })),
        reactions: reactionsResult.rows.reduce((acc: Record<string, number>, r: any) => {
          acc[r.reaction] = parseInt(r.count);
          return acc;
        }, {} as Record<string, number>),
        comments: commentsResult.rows.map((c: any) => ({
          id: c.id,
          content: c.content,
          parentCommentId: c.parent_comment_id,
          author: c.user_email || c.executor_email || 'Anonymous',
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/memorial/:vaultId/react
router.post(
  '/:vaultId/react',
  memorialRateLimiter,
  optionalAuth,
  validate(reactSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { vaultId } = req.params;
      const { reaction } = req.body;

      // Verify vault exists and is accessible
      const vaultResult = await query(
        'SELECT * FROM vaults WHERE id = $1',
        [vaultId]
      );

      if (vaultResult.rows.length === 0) {
        throw new AppError('Vault not found', 404);
      }

      const vault = vaultResult.rows[0];

      if (!vault.is_public && !req.userId) {
        throw new AppError('Vault is private', 403);
      }

      // Insert or update reaction
      if (req.userId) {
        // Delete existing reaction if exists, then insert new one
        await query(
          `DELETE FROM memorial_reactions 
           WHERE vault_id = $1 AND user_id = $2 AND reaction = $3`,
          [vaultId, req.userId, reaction]
        );
        await query(
          `INSERT INTO memorial_reactions (vault_id, user_id, reaction)
           VALUES ($1, $2, $3)`,
          [vaultId, req.userId, reaction]
        );
      } else {
        // Anonymous reactions - just insert (no user tracking)
        await query(
          `INSERT INTO memorial_reactions (vault_id, reaction)
           VALUES ($1, $2)`,
          [vaultId, reaction]
        );
      }

      res.json({ message: 'Reaction added', reaction });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/memorial/:vaultId/comment
router.post(
  '/:vaultId/comment',
  memorialRateLimiter,
  optionalAuth,
  validate(commentSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { vaultId } = req.params;
      const { content, parentCommentId } = req.body;

      if (!req.userId) {
        throw new AppError('Authentication required to comment', 401);
      }

      // Verify vault exists and is accessible
      const vaultResult = await query(
        'SELECT * FROM vaults WHERE id = $1',
        [vaultId]
      );

      if (vaultResult.rows.length === 0) {
        throw new AppError('Vault not found', 404);
      }

      // Insert comment
      const result = await query(
        `INSERT INTO memorial_comments (vault_id, user_id, content, parent_comment_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [vaultId, req.userId, content, parentCommentId || null]
      );

      res.status(201).json({
        message: 'Comment added',
        comment: {
          id: result.rows[0].id,
          content: result.rows[0].content,
          parentCommentId: result.rows[0].parent_comment_id,
          createdAt: result.rows[0].created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/memorial/:vaultId/stats
router.get(
  '/:vaultId/stats',
  memorialRateLimiter,
  optionalAuth,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { vaultId } = req.params;

      // Get view count (would need separate tracking table in production)
      const reactionsResult = await query(
        'SELECT COUNT(*) as count FROM memorial_reactions WHERE vault_id = $1',
        [vaultId]
      );

      const commentsResult = await query(
        'SELECT COUNT(*) as count FROM memorial_comments WHERE vault_id = $1',
        [vaultId]
      );

      res.json({
        reactions: parseInt(reactionsResult.rows[0].count),
        comments: parseInt(commentsResult.rows[0].count),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

