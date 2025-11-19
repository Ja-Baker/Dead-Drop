import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/triggers/status
router.get('/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    // Get user's last activity
    const userResult = await query(
      'SELECT last_activity_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const lastActivity = userResult.rows[0].last_activity_at;
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get active triggers
    const triggersResult = await query(
      `SELECT 
        t.id,
        t.vault_id,
        t.trigger_type,
        t.status,
        t.scheduled_date,
        t.inactivity_days,
        t.cancellation_deadline,
        v.name as vault_name
      FROM triggers t
      JOIN vaults v ON v.id = t.vault_id
      WHERE v.user_id = $1 AND t.status IN ('pending', 'active')
      ORDER BY t.created_at DESC`,
      [userId]
    );

    // Get proof of life status
    const proofOfLifeResult = await query(
      `SELECT 
        check_in_date,
        streak_count
      FROM proof_of_life
      WHERE user_id = $1
      ORDER BY check_in_date DESC
      LIMIT 1`,
      [userId]
    );

    const proofOfLife = proofOfLifeResult.rows[0] || null;

    res.json({
      daysSinceActivity,
      lastActivity,
      activeTriggers: triggersResult.rows.map((t: any) => ({
        id: t.id,
        vaultId: t.vault_id,
        vaultName: t.vault_name,
        triggerType: t.trigger_type,
        status: t.status,
        scheduledDate: t.scheduled_date,
        inactivityDays: t.inactivity_days,
        cancellationDeadline: t.cancellation_deadline,
      })),
      proofOfLife: proofOfLife ? {
        lastCheckIn: proofOfLife.check_in_date,
        streakCount: proofOfLife.streak_count,
      } : null,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/triggers/proof-of-life
router.post(
  '/proof-of-life',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const today = new Date().toISOString().split('T')[0];

      // Check if already checked in today
      const existingResult = await query(
        'SELECT * FROM proof_of_life WHERE user_id = $1 AND check_in_date = $2',
        [userId, today]
      );

      let streakCount = 1;

      if (existingResult.rows.length > 0) {
        // Already checked in today
        res.json({
          message: 'Already checked in today',
          streakCount: existingResult.rows[0].streak_count,
        });
        return;
      }

      // Get last check-in to calculate streak
      const lastCheckInResult = await query(
        `SELECT check_in_date, streak_count
         FROM proof_of_life
         WHERE user_id = $1
         ORDER BY check_in_date DESC
         LIMIT 1`,
        [userId]
      );

      if (lastCheckInResult.rows.length > 0) {
        const lastCheckIn = new Date(lastCheckInResult.rows[0].check_in_date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // Check if last check-in was yesterday (maintain streak)
        if (
          lastCheckIn.getTime() >= yesterday.getTime() &&
          lastCheckIn.getTime() < new Date(today).getTime()
        ) {
          streakCount = lastCheckInResult.rows[0].streak_count + 1;
        }
      }

      // Insert proof of life
      await query(
        `INSERT INTO proof_of_life (user_id, check_in_date, streak_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, check_in_date) 
         DO UPDATE SET streak_count = EXCLUDED.streak_count`,
        [userId, today, streakCount]
      );

      // Update user's last activity
      await query(
        'UPDATE users SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );

      res.json({
        message: "I'm still alive",
        streakCount,
        checkInDate: today,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/triggers/cancel
router.post(
  '/cancel',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { triggerId } = req.body as { triggerId: string };
      const userId = req.userId!;

      if (!triggerId) {
        throw new AppError('Trigger ID required', 400);
      }

      // Verify trigger belongs to user
      const triggerResult = await query(
        `SELECT t.* FROM triggers t
         JOIN vaults v ON v.id = t.vault_id
         WHERE t.id = $1 AND v.user_id = $2`,
        [triggerId, userId]
      );

      if (triggerResult.rows.length === 0) {
        throw new AppError('Trigger not found', 404);
      }

      const trigger = triggerResult.rows[0];

      // Check if within cancellation window
      if (trigger.cancellation_deadline) {
        const deadline = new Date(trigger.cancellation_deadline);
        if (new Date() > deadline) {
          throw new AppError('Cancellation window expired', 400);
        }
      }

      // Cancel trigger
      await query(
        'UPDATE triggers SET status = $1 WHERE id = $2',
        ['cancelled', triggerId]
      );

      res.json({ message: 'Trigger cancelled' });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/triggers/history
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const result = await query(
      `SELECT 
        t.id,
        t.vault_id,
        t.trigger_type,
        t.status,
        t.scheduled_date,
        t.triggered_at,
        t.created_at,
        v.name as vault_name
      FROM triggers t
      JOIN vaults v ON v.id = t.vault_id
      WHERE v.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT 50`,
      [userId]
    );

    res.json({
      triggers: result.rows.map((t: any) => ({
        id: t.id,
        vaultId: t.vault_id,
        vaultName: t.vault_name,
        triggerType: t.trigger_type,
        status: t.status,
        scheduledDate: t.scheduled_date,
        triggeredAt: t.triggered_at,
        createdAt: t.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

