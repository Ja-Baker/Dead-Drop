import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { z } from 'zod';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validation';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    ageVerified: z.boolean().refine((val) => val === true, 'Age verification required'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password required'),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token required'),
  }),
});

const verify2FASchema = z.object({
  body: z.object({
    token: z.string().length(6, '2FA token must be 6 digits'),
  }),
});

// POST /api/auth/signup
router.post(
  '/signup',
  authRateLimiter,
  validate(signupSchema),
  async (req, res: Response, next: NextFunction) => {
    try {
      const { email, password, ageVerified } = req.body;

      if (!ageVerified) {
        throw new AppError('Age verification required. Must be 18+', 400);
      }

      // Check if user exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('Email already registered', 409);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await query(
        `INSERT INTO users (email, password_hash, subscription_tier)
         VALUES ($1, $2, 'free')
         RETURNING id, email, subscription_tier, created_at`,
        [email.toLowerCase(), passwordHash]
      );

      const user = result.rows[0];

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier,
      });

      res.status(201).json({
        message: 'Account created. Plan accordingly.',
        user: {
          id: user.id,
          email: user.email,
          subscriptionTier: user.subscription_tier,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  async (req, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await query(
        'SELECT id, email, password_hash, subscription_tier, two_fa_enabled FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid email or password', 401);
      }

      const user = result.rows[0];

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Update last activity
      await query(
        'UPDATE users SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier,
      });

      res.json({
        message: 'Logged in. Still alive.',
        user: {
          id: user.id,
          email: user.email,
          subscriptionTier: user.subscription_tier,
          twoFactorEnabled: user.two_fa_enabled,
        },
        accessToken,
        refreshToken,
        requires2FA: user.two_fa_enabled,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  validate(refreshSchema),
  async (req, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists
      const result = await query(
        'SELECT id, email, subscription_tier FROM users WHERE id = $1',
        [payload.userId]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      const user = result.rows[0];

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier,
      });

      const newRefreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier,
      });

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/setup-2fa
router.post(
  '/setup-2fa',
  authenticate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      const userId = req.userId!;

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Dead Drop (${req.user?.email})`,
        issuer: 'Dead Drop',
      });

      // Save secret temporarily (user needs to verify before enabling)
      await query(
        'UPDATE users SET two_fa_secret = $1 WHERE id = $2',
        [secret.base32, userId]
      );

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: 'Scan QR code with authenticator app',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/verify-2fa
router.post(
  '/verify-2fa',
  authenticate,
  validate(verify2FASchema),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { token } = req.body;
      const userId = req.userId!;

      // Get user's 2FA secret
      const result = await query(
        'SELECT two_fa_secret, two_fa_enabled FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      const user = result.rows[0];

      if (!user.two_fa_secret) {
        throw new AppError('2FA not set up', 400);
      }

      // Verify token
      const isValid = speakeasy.totp.verify({
        secret: user.two_fa_secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!isValid) {
        throw new AppError('Invalid 2FA token', 401);
      }

      // Enable 2FA if not already enabled
      if (!user.two_fa_enabled) {
        await query(
          'UPDATE users SET two_fa_enabled = true WHERE id = $1',
          [userId]
        );
      }

      res.json({
        message: '2FA verified successfully',
        enabled: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    // In a stateless JWT system, logout is handled client-side
    // But we can invalidate refresh tokens if using a token blacklist
    res.json({ message: 'Logged out' });
  }
);

export default router;

