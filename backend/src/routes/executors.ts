import { Router, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { getTierLimits, checkTierLimit } from '../utils/subscription';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const inviteExecutorSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    accessLevel: z.enum(['primary', 'curator', 'viewer']).default('viewer'),
    vaultIds: z.array(z.string().uuid()).optional(),
  }),
});

const updateExecutorSchema = z.object({
  body: z.object({
    accessLevel: z.enum(['primary', 'curator', 'viewer']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid executor ID'),
  }),
});

// GET /api/executors
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const result = await query(
      `SELECT 
        e.id,
        e.email,
        e.phone,
        e.access_level,
        e.status,
        e.invited_at,
        e.accepted_at,
        COUNT(ve.vault_id) as vault_count
      FROM executors e
      LEFT JOIN vault_executors ve ON ve.executor_id = e.id
      WHERE e.user_id = $1
      GROUP BY e.id
      ORDER BY e.invited_at DESC`,
      [userId]
    );

    res.json({
      executors: result.rows.map((e: any) => ({
        id: e.id,
        email: e.email,
        phone: e.phone,
        accessLevel: e.access_level,
        status: e.status,
        vaultCount: parseInt(e.vault_count),
        invitedAt: e.invited_at,
        acceptedAt: e.accepted_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/executors/invite
router.post(
  '/invite',
  authenticate,
  validate(inviteExecutorSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const subscriptionTier = req.user?.subscriptionTier || 'free';
      const { email, phone, accessLevel, vaultIds } = req.body;

      // Check tier limits
      const limits = getTierLimits(subscriptionTier as any);

      // Count existing executors
      const executorCountResult = await query(
        'SELECT COUNT(*) as count FROM executors WHERE user_id = $1',
        [userId]
      );

      const executorCount = parseInt(executorCountResult.rows[0].count);

      if (!checkTierLimit(subscriptionTier as any, 'maxExecutors', executorCount)) {
        throw new AppError(
          `Executor limit reached. ${subscriptionTier} tier allows ${limits.maxExecutors === Infinity ? 'unlimited' : limits.maxExecutors} executors.`,
          403
        );
      }

      // Check if executor already exists
      const existingResult = await query(
        'SELECT id FROM executors WHERE user_id = $1 AND email = $2',
        [userId, email.toLowerCase()]
      );

      if (existingResult.rows.length > 0) {
        throw new AppError('Executor already invited', 409);
      }

      // Generate invite token
      const inviteToken = crypto.randomBytes(32).toString('hex');

      // Create executor
      const executorResult = await query(
        `INSERT INTO executors (user_id, email, phone, access_level, invite_token)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, email.toLowerCase(), phone || null, accessLevel, inviteToken]
      );

      const executor = executorResult.rows[0];

      // Assign to vaults if specified
      if (vaultIds && vaultIds.length > 0) {
        for (const vaultId of vaultIds) {
          // Verify vault ownership
          const vaultResult = await query(
            'SELECT id FROM vaults WHERE id = $1 AND user_id = $2',
            [vaultId, userId]
          );

          if (vaultResult.rows.length > 0) {
            await query(
              'INSERT INTO vault_executors (vault_id, executor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [vaultId, executor.id]
            );
          }
        }
      }

      // TODO: Send invite email

      res.status(201).json({
        message: 'Executor added. They know now.',
        executor: {
          id: executor.id,
          email: executor.email,
          phone: executor.phone,
          accessLevel: executor.access_level,
          status: executor.status,
          inviteToken: executor.invite_token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/executors/:id/permissions
router.put(
  '/:id/permissions',
  authenticate,
  validate(updateExecutorSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { accessLevel } = req.body;

      // Verify ownership
      const executorResult = await query(
        'SELECT * FROM executors WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (executorResult.rows.length === 0) {
        throw new AppError('Executor not found', 404);
      }

      // Update access level
      const result = await query(
        'UPDATE executors SET access_level = $1 WHERE id = $2 RETURNING *',
        [accessLevel, id]
      );

      res.json({
        message: 'Executor permissions updated',
        executor: {
          id: result.rows[0].id,
          email: result.rows[0].email,
          accessLevel: result.rows[0].access_level,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/executors/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const result = await query(
      'DELETE FROM executors WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Executor not found', 404);
    }

    res.json({ message: 'Executor removed' });
  } catch (error) {
    next(error);
  }
});

// POST /api/executors/vote-trigger
router.post(
  '/vote-trigger',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // This will be implemented in Sprint 2 with trigger system
      res.status(501).json({ error: 'Not implemented yet' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

