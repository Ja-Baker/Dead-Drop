import { Router, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { getTierLimits } from '../utils/subscription';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Configure multer for memory storage (will upload to S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

const createContentSchema = z.object({
  body: z.object({
    type: z.enum(['image', 'video', 'audio', 'text', 'url']),
    metadata: z.record(z.any()).optional(),
    displayOrder: z.number().int().optional(),
  }),
  params: z.object({
    vaultId: z.string().uuid('Invalid vault ID'),
  }),
});

// POST /api/vaults/:vaultId/content
router.post(
  '/:vaultId/content',
  authenticate,
  uploadRateLimiter,
  upload.single('file'),
  validate(createContentSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { vaultId } = req.params;
      const userId = req.userId!;
      const subscriptionTier = req.user?.subscriptionTier || 'free';
      const { type, metadata, displayOrder } = req.body;
      const file = req.file;

      // Verify vault ownership
      const vaultResult = await query(
        'SELECT * FROM vaults WHERE id = $1 AND user_id = $2',
        [vaultId, userId]
      );

      if (vaultResult.rows.length === 0) {
        throw new AppError('Vault not found', 404);
      }

      const vault = vaultResult.rows[0];
      const limits = getTierLimits(subscriptionTier as any);

      // Check content count
      const contentCountResult = await query(
        'SELECT COUNT(*) as count FROM content WHERE vault_id = $1',
        [vaultId]
      );

      const contentCount = parseInt(contentCountResult.rows[0].count);

      if (contentCount >= limits.maxContent) {
        throw new AppError(
          `Content limit reached. ${subscriptionTier} tier allows ${limits.maxContent === Infinity ? 'unlimited' : limits.maxContent} content pieces.`,
          403
        );
      }

      // Check video uploads
      if (type === 'video' && !limits.videoUploads) {
        throw new AppError('Video uploads not available on free tier', 403);
      }

      let filePath: string | null = null;
      let encryptedData: string | null = null;

      // Handle file uploads
      if (file && (type === 'image' || type === 'video' || type === 'audio')) {
        // TODO: Upload to S3 or Railway storage
        // For now, store file path placeholder
        filePath = `uploads/${vaultId}/${Date.now()}-${file.originalname}`;

        // If vault is encrypted, encrypt the file data
        if (vault.is_encrypted) {
          // TODO: Implement encryption
          encryptedData = 'encrypted_data_placeholder';
        }
      }

      // Handle text content
      if (type === 'text' && metadata?.text) {
        if (vault.is_encrypted) {
          // TODO: Encrypt text
          encryptedData = metadata.text;
        }
      }

      // Get max display order
      const maxOrderResult = await query(
        'SELECT COALESCE(MAX(display_order), 0) as max_order FROM content WHERE vault_id = $1',
        [vaultId]
      );

      const maxOrder = parseInt(maxOrderResult.rows[0].max_order) || 0;

      // Create content
      const result = await query(
        `INSERT INTO content (vault_id, type, file_path, encrypted_data, metadata, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          vaultId,
          type,
          filePath,
          encryptedData,
          JSON.stringify(metadata || {}),
          displayOrder !== undefined ? displayOrder : maxOrder + 1,
        ]
      );

      res.status(201).json({
        message: 'Content added',
        content: {
          id: result.rows[0].id,
          type: result.rows[0].type,
          filePath: result.rows[0].file_path,
          metadata: result.rows[0].metadata,
          displayOrder: result.rows[0].display_order,
          createdAt: result.rows[0].created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/vaults/:vaultId/content/:contentId
router.delete(
  '/:vaultId/content/:contentId',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { vaultId, contentId } = req.params;
      const userId = req.userId!;

      // Verify vault ownership
      const vaultResult = await query(
        'SELECT id FROM vaults WHERE id = $1 AND user_id = $2',
        [vaultId, userId]
      );

      if (vaultResult.rows.length === 0) {
        throw new AppError('Vault not found', 404);
      }

      // Delete content
      const result = await query(
        'DELETE FROM content WHERE id = $1 AND vault_id = $2 RETURNING id',
        [contentId, vaultId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Content not found', 404);
      }

      // TODO: Delete file from storage

      res.json({ message: 'Content deleted' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

