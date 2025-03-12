import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import { CustomRequest } from '../middleware/auth';
import logger from '../utils/logger';

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private
 */
export const createProject = async (req: CustomRequest, res: Response) => {
  try {
    const { name, description, category, githubRepo, teamMembers, tags } = req.body;

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Create new project
    const project = new Project({
      name,
      description,
      category,
      creator: req.user.id,
      teamMembers: teamMembers || [],
      githubRepo,
      tags: tags || [],
      status: 'planning'
    });

    // Save project
    await project.save();

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    logger.error(`Error creating project: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while creating project'
    });
  }
};

/**
 * Get all projects with filtering and pagination
 * @route GET /api/projects
 * @access Public
 */
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      tag, 
      search,
      page = 1, 
      limit = 10 
    } = req.query;

    // Build filter
    const filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (tag) {
      filter.tags = tag;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const projects = await Project.find(filter)
      .populate('creator', 'username email')
      .populate('teamMembers', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      count: projects.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      projects
    });
  } catch (error) {
    logger.error(`Error getting projects: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
};

/**
 * Get a project by ID
 * @route GET /api/projects/:id
 * @access Public
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    // Find project
    const project = await Project.findById(projectId)
      .populate('creator', 'username email')
      .populate('teamMembers', 'username email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    logger.error(`Error getting project: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project'
    });
  }
};

/**
 * Update a project
 * @route PUT /api/projects/:id
 * @access Private
 */
export const updateProject = async (req: CustomRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    const { 
      name, 
      description, 
      category, 
      githubRepo, 
      teamMembers, 
      tags,
      status
    } = req.body;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the creator of the project
    if (project.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (category) project.category = category;
    if (githubRepo) project.githubRepo = githubRepo;
    if (teamMembers) project.teamMembers = teamMembers;
    if (tags) project.tags = tags;
    if (status) project.status = status;

    // Save updated project
    await project.save();

    // Return updated project with populated fields
    const updatedProject = await Project.findById(projectId)
      .populate('creator', 'username email')
      .populate('teamMembers', 'username email');

    res.json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    logger.error(`Error updating project: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project'
    });
  }
};

/**
 * Delete a project
 * @route DELETE /api/projects/:id
 * @access Private
 */
export const deleteProject = async (req: CustomRequest, res: Response) => {
  try {
    const projectId = req.params.id;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is the creator of the project
    if (project.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Delete project
    await Project.findByIdAndDelete(projectId);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting project: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project'
    });
  }
}; 