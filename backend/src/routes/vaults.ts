import { Router, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { getTierLimits, checkTierLimit } from '../utils/subscription';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const createVaultSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Vault name required').max(255, 'Vault name too long'),
    icon: z.string().max(10).optional(),
    description: z.string().optional(),
    triggerType: z.enum(['inactivity', 'scheduled', 'manual', 'death_certificate', 'executor_vote']),
    triggerConfig: z.record(z.any()).optional(),
    isEncrypted: z.boolean().default(false),
  }),
});

const updateVaultSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    icon: z.string().max(10).optional(),
    description: z.string().optional(),
    triggerType: z.enum(['inactivity', 'scheduled', 'manual', 'death_certificate', 'executor_vote']).optional(),
    triggerConfig: z.record(z.any()).optional(),
    isEncrypted: z.boolean().optional(),
    isPublic: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid vault ID'),
  }),
});

// GET /api/vaults
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;

    const result = await query(
      `SELECT 
        v.id,
        v.name,
        v.icon,
        v.description,
        v.trigger_type,
        v.trigger_config,
        v.is_encrypted,
        v.is_public,
        v.custom_slug,
        v.created_at,
        v.updated_at,
        COUNT(c.id) as content_count
      FROM vaults v
      LEFT JOIN content c ON c.vault_id = v.id
      WHERE v.user_id = $1
      GROUP BY v.id
      ORDER BY v.created_at DESC`,
      [userId]
    );

    res.json({
      vaults: result.rows.map((v: any) => ({
        id: v.id,
        name: v.name,
        icon: v.icon,
        description: v.description,
        triggerType: v.trigger_type,
        triggerConfig: v.trigger_config,
        isEncrypted: v.is_encrypted,
        isPublic: v.is_public,
        customSlug: v.custom_slug,
        contentCount: parseInt(v.content_count),
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/vaults/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const result = await query(
      `SELECT 
        v.*,
        COUNT(c.id) as content_count
      FROM vaults v
      LEFT JOIN content c ON c.vault_id = v.id
      WHERE v.id = $1 AND v.user_id = $2
      GROUP BY v.id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Vault not found', 404);
    }

    const vault = result.rows[0];

    res.json({
      id: vault.id,
      name: vault.name,
      icon: vault.icon,
      description: vault.description,
      triggerType: vault.trigger_type,
      triggerConfig: vault.trigger_config,
      isEncrypted: vault.is_encrypted,
      isPublic: vault.is_public,
      customSlug: vault.custom_slug,
      contentCount: parseInt(vault.content_count),
      createdAt: vault.created_at,
      updatedAt: vault.updated_at,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/vaults
router.post(
  '/',
  authenticate,
  validate(createVaultSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const userId = req.userId!;
      const subscriptionTier = req.user?.subscriptionTier || 'free';
      const { name, icon, description, triggerType, triggerConfig, isEncrypted } = req.body;

      // Check tier limits
      const limits = getTierLimits(subscriptionTier as any);

      // Check if trigger type is allowed
      if (!limits.allowedTriggerTypes.includes(triggerType)) {
        throw new AppError(
          `Trigger type '${triggerType}' not available on ${subscriptionTier} tier`,
          403
        );
      }

      // Check encryption availability
      if (isEncrypted && !limits.encryption) {
        throw new AppError('Encryption not available on free tier', 403);
      }

      // Count existing vaults
      const vaultCountResult = await query(
        'SELECT COUNT(*) as count FROM vaults WHERE user_id = $1',
        [userId]
      );

      const vaultCount = parseInt(vaultCountResult.rows[0].count);

      if (!checkTierLimit(subscriptionTier as any, 'maxVaults', vaultCount)) {
        throw new AppError(
          `Vault limit reached. ${subscriptionTier} tier allows ${limits.maxVaults === Infinity ? 'unlimited' : limits.maxVaults} vaults.`,
          403
        );
      }

      // Create vault
      const result = await query(
        `INSERT INTO vaults (user_id, name, icon, description, trigger_type, trigger_config, is_encrypted)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, name, icon || null, description || null, triggerType, JSON.stringify(triggerConfig || {}), isEncrypted]
      );

      const vault = result.rows[0];

      res.status(201).json({
        message: 'Vault created. Plan accordingly.',
        vault: {
          id: vault.id,
          name: vault.name,
          icon: vault.icon,
          description: vault.description,
          triggerType: vault.trigger_type,
          triggerConfig: vault.trigger_config,
          isEncrypted: vault.is_encrypted,
          createdAt: vault.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/vaults/:id
router.put(
  '/:id',
  authenticate,
  validate(updateVaultSchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const subscriptionTier = req.user?.subscriptionTier || 'free';
      const updates = req.body;

      // Verify vault ownership
      const vaultResult = await query(
        'SELECT * FROM vaults WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (vaultResult.rows.length === 0) {
        throw new AppError('Vault not found', 404);
      }

      const vault = vaultResult.rows[0];
      const limits = getTierLimits(subscriptionTier as any);

      // Check trigger type if changing
      if (updates.triggerType && !limits.allowedTriggerTypes.includes(updates.triggerType)) {
        throw new AppError(
          `Trigger type '${updates.triggerType}' not available on ${subscriptionTier} tier`,
          403
        );
      }

      // Check encryption if enabling
      if (updates.isEncrypted && !limits.encryption) {
        throw new AppError('Encryption not available on free tier', 403);
      }

      // Build update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updates.name);
      }
      if (updates.icon !== undefined) {
        updateFields.push(`icon = $${paramIndex++}`);
        updateValues.push(updates.icon);
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(updates.description);
      }
      if (updates.triggerType !== undefined) {
        updateFields.push(`trigger_type = $${paramIndex++}`);
        updateValues.push(updates.triggerType);
      }
      if (updates.triggerConfig !== undefined) {
        updateFields.push(`trigger_config = $${paramIndex++}`);
        updateValues.push(JSON.stringify(updates.triggerConfig));
      }
      if (updates.isEncrypted !== undefined) {
        updateFields.push(`is_encrypted = $${paramIndex++}`);
        updateValues.push(updates.isEncrypted);
      }
      if (updates.isPublic !== undefined) {
        updateFields.push(`is_public = $${paramIndex++}`);
        updateValues.push(updates.isPublic);
      }

      if (updateFields.length === 0) {
        throw new AppError('No fields to update', 400);
      }

      updateValues.push(id, userId);

      const result = await query(
        `UPDATE vaults 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
         RETURNING *`,
        updateValues
      );

      res.json({
        message: 'Vault updated',
        vault: {
          id: result.rows[0].id,
          name: result.rows[0].name,
          icon: result.rows[0].icon,
          description: result.rows[0].description,
          triggerType: result.rows[0].trigger_type,
          triggerConfig: result.rows[0].trigger_config,
          isEncrypted: result.rows[0].is_encrypted,
          isPublic: result.rows[0].is_public,
          updatedAt: result.rows[0].updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/vaults/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const result = await query(
      'DELETE FROM vaults WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Vault not found', 404);
    }

    res.json({ message: 'Vault deleted forever' });
  } catch (error) {
    next(error);
  }
});

// GET /api/vaults/:id/preview
router.get('/:id/preview', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // Verify ownership
    const vaultResult = await query(
      'SELECT * FROM vaults WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (vaultResult.rows.length === 0) {
      throw new AppError('Vault not found', 404);
    }

    // Get vault with content
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
      [id]
    );

    const vault = vaultResult.rows[0];

    res.json({
      vault: {
        id: vault.id,
        name: vault.name,
        icon: vault.icon,
        description: vault.description,
        triggerType: vault.trigger_type,
        triggerConfig: vault.trigger_config,
        isEncrypted: vault.is_encrypted,
        isPublic: vault.is_public,
      },
      content: contentResult.rows.map((c: any) => ({
        id: c.id,
        type: c.type,
        filePath: c.file_path,
        metadata: c.metadata,
        displayOrder: c.display_order,
        createdAt: c.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

