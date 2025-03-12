import { Request, Response } from 'express';
import * as TokenService from '../services/token.service';
import * as PumpFunService from '../services/pumpfun.service';
import { logger } from '../utils/logger';

/**
 * Create a new token
 */
export const createToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const tokenData = { ...req.body, creator: userId };
    
    const token = await TokenService.createToken(tokenData);
    
    return res.status(201).json({
      success: true,
      data: token
    });
  } catch (error: any) {
    logger.error('Error creating token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create token',
      error: error.message
    });
  }
};

/**
 * Get all tokens created by a user
 */
export const getTokensByUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const tokens = await TokenService.getTokensByUser(userId);
    
    return res.status(200).json({
      success: true,
      data: tokens
    });
  } catch (error: any) {
    logger.error('Error fetching user tokens:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tokens',
      error: error.message
    });
  }
};

/**
 * Get token by address
 */
export const getTokenByAddress = async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    const token = await TokenService.getTokenByAddress(tokenAddress);
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: token
    });
  } catch (error: any) {
    logger.error('Error fetching token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch token',
      error: error.message
    });
  }
};

/**
 * Get available token templates
 */
export const getTokenTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await TokenService.getTokenTemplates();
    
    return res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    logger.error('Error fetching token templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch token templates',
      error: error.message
    });
  }
};

/**
 * Deploy token to blockchain
 */
export const deployToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { tokenAddress } = req.params;
    
    // Ensure the token belongs to the requesting user
    const token = await TokenService.getTokenByAddress(tokenAddress);
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    if (token.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this token'
      });
    }
    
    // Deploy the token
    const deployedToken = await TokenService.deployToken(tokenAddress);
    
    return res.status(200).json({
      success: true,
      data: deployedToken,
      message: 'Token deployed successfully'
    });
  } catch (error: any) {
    logger.error('Error deploying token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deploy token',
      error: error.message
    });
  }
};

/**
 * Setup token trading on Pump.fun
 */
export const setupTokenTrading = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { tokenAddress } = req.params;
    const { initialPrice, liquidityAmount } = req.body;
    
    // Ensure the token belongs to the requesting user
    const token = await TokenService.getTokenByAddress(tokenAddress);
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    if (token.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not own this token'
      });
    }
    
    // Setup trading on Pump.fun
    const tradingInfo = await PumpFunService.setupTrading(
      tokenAddress,
      initialPrice,
      liquidityAmount
    );
    
    return res.status(200).json({
      success: true,
      data: tradingInfo,
      message: 'Trading setup successfully on Pump.fun'
    });
  } catch (error: any) {
    logger.error('Error setting up token trading:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to setup token trading',
      error: error.message
    });
  }
}; 