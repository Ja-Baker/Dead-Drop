import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Auto-detect Railway Redis URL if REDIS_URL not set
const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  
  // Try Railway's automatic Redis variable
  if (process.env.REDISCLOUD_URL) {
    return process.env.REDISCLOUD_URL;
  }
  
  return null;
};

export const redisClient = createClient({
  url: getRedisUrl() || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.disconnect();
  }
};

