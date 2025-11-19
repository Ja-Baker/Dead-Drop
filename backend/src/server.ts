import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
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
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for React
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
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

// Serve static files from web build (if it exists)
const webBuildPath = join(__dirname, '../../web/dist');
if (existsSync(webBuildPath)) {
  app.use(express.static(webBuildPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api') || req.path === '/health') {
      return res.status(404).json({ error: 'Not found. This endpoint does not exist.' });
    }
    res.sendFile(join(webBuildPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  // Fallback if web build doesn't exist
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Dead Drop API',
      version: '1.0.0',
      status: 'alive',
      message: '🪦 YOUR FINAL DROP',
      note: 'Web UI not built. Run: cd web && npm run build',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        vaults: '/api/vaults',
        executors: '/api/executors',
        triggers: '/api/triggers',
        memorial: '/api/memorial',
        subscription: '/api/subscription'
      }
    });
  });
  
  // 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found. This endpoint does not exist.' });
  });
}

// Error handler (must be last)
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

  // Connect to database with retries and auto-migrate
  // Check for any database URL (Railway auto-sets these)
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRIVATE_URL;
  if (dbUrl) {
    retryConnection(
      async () => {
        await pool.query('SELECT NOW()');
        console.log('Database connected');
        
        // Auto-run migrations if tables don't exist
        try {
          const tableCheck = await pool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'users'
            );
          `);
          
          if (!tableCheck.rows[0].exists) {
            console.log('Running automatic database migrations...');
            const migrationSQL = readFileSync(
              join(__dirname, 'db', 'migrations', '001_initial_schema.sql'),
              'utf-8'
            );
            await pool.query(migrationSQL);
            console.log('✅ Database migrations completed automatically');
          } else {
            console.log('Database tables already exist, skipping migrations');
          }
        } catch (migrationError) {
          console.error('Migration error (non-fatal):', migrationError);
          // Continue even if migrations fail
        }
      },
      10,
      2000
    ).catch((error) => {
      console.error('Failed to connect to database after retries:', error);
      console.error('Server will continue but database operations will fail');
    });
  } else {
    console.warn('⚠️  No database URL found. Add PostgreSQL service in Railway for database features.');
  }

  // Connect to Redis with retries (optional)
  // Check for any Redis URL (Railway auto-sets these)
  const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL;
  if (redisUrl) {
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
    console.warn('⚠️  No Redis URL found. Redis features will not work (optional).');
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

