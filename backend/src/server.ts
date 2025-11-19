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

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('Database connected');

    // Connect Redis
    await connectRedis();
    console.log('Redis connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

