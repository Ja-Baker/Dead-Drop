import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  subscriptionTier: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  // Auto-generate secret if not set (for development/testing only)
  const secret = process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('WARNING: Using auto-generated JWT_SECRET. Set JWT_SECRET in production!');
    return 'dev-secret-change-in-production-' + Date.now();
  })();
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  // Auto-generate secret if not set (for development/testing only)
  const secret = process.env.JWT_REFRESH_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_REFRESH_SECRET must be set in production');
    }
    console.warn('WARNING: Using auto-generated JWT_REFRESH_SECRET. Set JWT_REFRESH_SECRET in production!');
    return 'dev-refresh-secret-change-in-production-' + Date.now();
  })();
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  // Use same auto-generation logic as generateAccessToken
  const secret = process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-secret-change-in-production-' + Date.now();
  })();

  return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  // Use same auto-generation logic as generateRefreshToken
  const secret = process.env.JWT_REFRESH_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_REFRESH_SECRET must be set in production');
    }
    return 'dev-refresh-secret-change-in-production-' + Date.now();
  })();

  return jwt.verify(token, secret) as TokenPayload;
};

