import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import logger from '../utils/logger';
import { CustomRequest } from '../middleware/auth';
import { TokenModel } from '../models/token.model';

const JWT_SECRET = process.env.JWT_SECRET || 'devlaunch_secret_key';

/**
 * Register a new user
 * @route POST /api/users/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, walletAddress } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    user = new User({
      email,
      password,
      username,
      walletAddress: walletAddress || ''
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            walletAddress: user.walletAddress,
            createdAt: user.createdAt
          }
        });
      }
    );
  } catch (error) {
    logger.error(`User registration error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * Login user
 * @route POST /api/users/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            walletAddress: user.walletAddress,
            createdAt: user.createdAt
          }
        });
      }
    );
  } catch (error) {
    logger.error(`User login error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Get current authenticated user
 * @route GET /api/users/me
 */
export const getCurrentUser = async (req: CustomRequest, res: Response) => {
  try {
    // Get user from database (exclude password)
    const user = await User.findById(req.user?.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error(`Get current user error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/me
 */
export const updateProfile = async (req: CustomRequest, res: Response) => {
  try {
    const { username, walletAddress, bio } = req.body;

    // Get user from database
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (username) user.username = username;
    if (walletAddress) user.walletAddress = walletAddress;
    if (bio) user.bio = bio;

    // Save updated user
    await user.save();

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`Update profile error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    // Get user from database (exclude password)
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error(`Get user by ID error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
};

/**
 * Get tokens created by a user
 */
export const getUserTokens = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Find tokens created by user
    const tokens = await TokenModel.find({ owner: user.walletAddress });
    
    return res.status(200).json({
      success: true,
      tokens,
      user: {
        id: user._id,
        username: user.username,
      }
    });
  } catch (error: any) {
    logger.error('Error fetching user tokens', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch tokens', error: error.message });
  }
}; 