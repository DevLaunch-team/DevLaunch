import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import logger from '../utils/logger';

// Create Redis client (if available) - Keep Redis connection for future use
let redisClient: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    logger.info('Redis connected for rate limiting');
  } else {
    logger.warn('No REDIS_URL provided, using memory store for rate limiting');
  }
} catch (error) {
  logger.error(`Redis connection error: ${error}`);
  logger.warn('Falling back to memory store for rate limiting');
}

// Basic rate limit, 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true, // Return rate limit standard headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: { message: 'Too many requests, please try again later.' },
  // Temporarily using memory store, can be replaced with Redis store later
});

// Stricter rate limit for sensitive operations (like token creation)
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many token operations, please try again later.' },
});

// Authentication related rate limit (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

// Wallet operations rate limit
export const walletLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many wallet operations, please try again later.' },
});

// TODO: Need to implement Redis store compatible with express-rate-limit in the future
// Consider using @rate-limit/redis or other compatible packages 