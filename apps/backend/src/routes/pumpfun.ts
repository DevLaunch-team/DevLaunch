import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateJWT } from '../middleware/auth';
import pumpfunService from '../services/pumpfun.service';
import logger from '../utils/logger';

const router = Router();

/**
 * @route POST /api/pumpfun/pairs
 * @desc Create trading pair
 * @access Private
 */
router.post(
  '/pairs',
  authenticateJWT,
  [
    body('tokenAddress').isString().notEmpty().withMessage('Token address cannot be empty'),
    body('initialPrice').isNumeric().withMessage('Initial price must be a number'),
    body('liquidityAmount').isNumeric().withMessage('Liquidity amount must be a number'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { tokenAddress, initialPrice, liquidityAmount } = req.body;
      const walletAddress = req.user?.walletAddress;
      
      if (!walletAddress) {
        return res.status(400).json({ 
          success: false, 
          message: 'User wallet address not set' 
        });
      }
      
      const result = await pumpfunService.createTradingPair(
        tokenAddress,
        Number(initialPrice),
        Number(liquidityAmount),
        walletAddress
      );
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to create trading pair', 
          error: result.error 
        });
      }
      
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to create trading pair:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/pumpfun/tokens/:tokenAddress/price
 * @desc Get token price information
 * @access Public
 */
router.get(
  '/tokens/:tokenAddress/price',
  [
    param('tokenAddress').isString().notEmpty().withMessage('Token address cannot be empty'),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { tokenAddress } = req.params;
      
      const result = await pumpfunService.getTokenPrice(tokenAddress);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to get token price', 
          error: result.error 
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Failed to get token price:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/pumpfun/tokens/:tokenAddress/trades
 * @desc Get token trade history
 * @access Public
 */
router.get(
  '/tokens/:tokenAddress/trades',
  [
    param('tokenAddress').isString().notEmpty().withMessage('Token address cannot be empty'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { tokenAddress } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      
      const result = await pumpfunService.getTokenTrades(tokenAddress, limit);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to get token trade history', 
          error: result.error 
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.trades
      });
    } catch (error) {
      logger.error('Failed to get token trade history:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/pumpfun/users/:walletAddress/trades
 * @desc Get user trade history
 * @access Public
 */
router.get(
  '/users/:walletAddress/trades',
  [
    param('walletAddress').isString().notEmpty().withMessage('Wallet address cannot be empty'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      
      const result = await pumpfunService.getUserTrades(walletAddress, limit);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to get user trade history', 
          error: result.error 
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.trades
      });
    } catch (error) {
      logger.error('Failed to get user trade history:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route GET /api/pumpfun/tokens/trending
 * @desc Get trending tokens list
 * @access Public
 */
router.get(
  '/tokens/trending',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      
      const result = await pumpfunService.getTrendingTokens(limit);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to get trending tokens list', 
          error: result.error 
        });
      }
      
      return res.status(200).json({
        success: true,
        data: result.tokens
      });
    } catch (error) {
      logger.error('Failed to get trending tokens list:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router; 