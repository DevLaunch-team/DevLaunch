import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Project from '../models/Project';
import TokenModel from '../models/token.model';
import logger from '../utils/logger';
import { CustomRequest } from '../middleware/auth';

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/dashboard
 * @access Admin
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get total projects count
    const totalProjects = await Project.countDocuments();

    // Get total tokens count
    const totalTokens = await TokenModel.countDocuments();

    // Get new users registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Get active users (users who logged in within the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: sevenDaysAgo }
    });

    // Return dashboard stats
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
        totalTokens,
        newUsersToday,
        activeUsers
      }
    });
  } catch (error) {
    logger.error(`Error getting dashboard stats: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while getting dashboard stats'
    });
  }
};

/**
 * Get all users (admin only)
 * @route GET /api/admin/users
 * @access Admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await User.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      users,
      total,
      page,
      totalPages
    });
  } catch (error) {
    logger.error(`Error getting all users: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while getting users'
    });
  }
};

/**
 * Update a user (admin only)
 * @route PUT /api/admin/users/:id
 * @access Admin
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { username, email, role } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    
    // In a real app, you'd have a role field in your schema
    // For now, we'll just assume role is managed elsewhere

    // Save user
    await user.save();

    // Return updated user (excluding password)
    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    logger.error(`Error updating user: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

/**
 * Get all projects (admin only)
 * @route GET /api/admin/projects
 * @access Admin
 */
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get projects with pagination
    const projects = await Project.find(query)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Project.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      projects,
      total,
      page,
      totalPages
    });
  } catch (error) {
    logger.error(`Error getting all projects: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while getting projects'
    });
  }
};

/**
 * Get system logs (admin only)
 * @route GET /api/admin/system/logs
 * @access Admin
 */
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const level = req.query.level as string;
    const limit = parseInt(req.query.limit as string) || 100;

    // In a real application, you would query logs from a database or log file
    // For this example, we'll return mock data
    
    const mockLogs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'Server started successfully',
        service: 'app'
      },
      {
        timestamp: new Date(Date.now() - 60000),
        level: 'debug',
        message: 'Database connection established',
        service: 'database'
      },
      {
        timestamp: new Date(Date.now() - 120000),
        level: 'warn',
        message: 'Rate limit exceeded for user',
        service: 'auth'
      },
      {
        timestamp: new Date(Date.now() - 180000),
        level: 'error',
        message: 'Failed to process payment',
        service: 'payment'
      }
    ];

    // Filter logs by level if specified
    let filteredLogs = mockLogs;
    if (level) {
      filteredLogs = mockLogs.filter(log => log.level === level);
    }

    // Limit number of logs
    const limitedLogs = filteredLogs.slice(0, limit);

    res.json({
      success: true,
      logs: limitedLogs
    });
  } catch (error) {
    logger.error(`Error getting system logs: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while getting system logs'
    });
  }
}; 