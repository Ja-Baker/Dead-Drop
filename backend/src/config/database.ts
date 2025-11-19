import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Auto-detect Railway PostgreSQL URL if DATABASE_URL not set
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Try Railway's automatic PostgreSQL variable
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL;
  }
  
  // Try Railway's PostgreSQL_PRIVATE_URL
  if (process.env.POSTGRES_PRIVATE_URL) {
    return process.env.POSTGRES_PRIVATE_URL;
  }
  
  return null;
};

export const pool = new Pool({
  connectionString: getDatabaseUrl() || undefined,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings for Railway
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error: any) {
    console.error('Database query error', { 
      text: text.substring(0, 100), 
      error: error.message,
      code: error.code,
      detail: error.detail,
    });
    throw error;
  }
};

