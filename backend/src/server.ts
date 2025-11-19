import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { pool } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth';
import vaultRoutes from './routes/vaults';
import executorRoutes from './routes/executors';
import triggerRoutes from './routes/triggers';
import memorialRoutes from './routes/memorial';
import subscriptionRoutes from './routes/subscription';
import contentRoutes from './routes/content';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Still alive' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vaults', apiRateLimiter, vaultRoutes);
app.use('/api/vaults', contentRoutes);
app.use('/api/executors', apiRateLimiter, executorRoutes);
app.use('/api/triggers', apiRateLimiter, triggerRoutes);
app.use('/api/memorial', memorialRoutes);
app.use('/api/subscription', apiRateLimiter, subscriptionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found. This endpoint does not exist.' });
});

// Error handler
app.use(errorHandler);

// Retry connection with exponential backoff
const retryConnection = async (
  fn: () => Promise<any>,
  maxRetries: number = 10,
  delay: number = 2000
): Promise<void> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      console.log(`Connection attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 10000); // Exponential backoff, max 10s
    }
  }
};

// Start server
const startServer = async () => {
  // Start the server first (so Railway health checks pass)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Connect to database with retries
  if (process.env.DATABASE_URL) {
    retryConnection(
      async () => {
        await pool.query('SELECT NOW()');
        console.log('Database connected');
      },
      10,
      2000
    ).catch((error) => {
      console.error('Failed to connect to database after retries:', error);
      console.error('Server will continue but database operations will fail');
    });
  } else {
    console.warn('DATABASE_URL not set, database features will not work');
  }

  // Connect to Redis with retries (optional)
  if (process.env.REDIS_URL) {
    retryConnection(
      async () => {
        await connectRedis();
        console.log('Redis connected');
      },
      5,
      2000
    ).catch((error) => {
      console.error('Failed to connect to Redis after retries:', error);
      console.warn('Server will continue but Redis features will not work');
    });
  } else {
    console.warn('REDIS_URL not set, Redis features will not work');
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

