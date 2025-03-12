import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import logger from '../utils/logger';

// Extend Request interface to include user information
export interface CustomRequest extends Request {
  user?: {
    id: string;
    email?: string;
    username?: string;
    role?: string;
    walletAddress?: string;
  };
  // Note: params, body, query and other properties are already inherited from Request interface
}

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  user: {
    id: string;
  };
  iat?: number;
  exp?: number;
}

/**
 * JWT Authentication Middleware
 * Verifies the authentication token in the request header
 */
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_secret'
      ) as JwtPayload;

      // Add user info to request object
      (req as CustomRequest).user = decoded.user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Admin authorization middleware
 * Verifies the user has admin privileges
 */
export const requireAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user exists in request
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // In a real application, you would check if the user has admin role
    // For now, we'll just use an environment variable for allowed admin IDs
    const adminIds = (process.env.ADMIN_IDS || '').split(',');
    
    if (!adminIds.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    next();
  } catch (error) {
    logger.error(`Admin authorization error: ${error}`);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Optional JWT Authentication Middleware
 * If token exists and is valid, adds user information to req.user
 * If token is invalid or missing, continues without authentication
 */
export const optionalAuthenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }
    
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'default_secret'
      ) as JwtPayload;
      
      (req as CustomRequest).user = decoded.user;
    } catch (error) {
      // If token is invalid, continue without user info
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}; 