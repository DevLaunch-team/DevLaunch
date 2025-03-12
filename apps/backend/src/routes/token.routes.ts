import { Router } from 'express';
import { body } from 'express-validator';
import * as TokenController from '../controllers/token.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

/**
 * @route POST /api/tokens
 * @desc Create a new token
 * @access Private
 */
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Token name is required'),
    body('symbol').notEmpty().withMessage('Token symbol is required'),
    body('decimals').isInt({ min: 0, max: 9 }).withMessage('Decimals must be between 0 and 9'),
    body('initialSupply').isNumeric().withMessage('Initial supply must be a number'),
    body('description').optional(),
    body('tokenType').isIn(['standard', 'governance', 'utility', 'nft']).withMessage('Invalid token type'),
    body('mintAuthority').optional(),
    body('freezeAuthority').optional().isBoolean(),
  ],
  validateRequest,
  TokenController.createToken
);

/**
 * @route GET /api/tokens
 * @desc Get all tokens created by the authenticated user
 * @access Private
 */
router.get('/', authenticate, TokenController.getTokensByUser);

/**
 * @route GET /api/tokens/:tokenAddress
 * @desc Get token details by address
 * @access Public
 */
router.get('/:tokenAddress', TokenController.getTokenByAddress);

/**
 * @route GET /api/tokens/templates
 * @desc Get available token templates
 * @access Public
 */
router.get('/templates', TokenController.getTokenTemplates);

/**
 * @route POST /api/tokens/:tokenAddress/deploy
 * @desc Deploy token to blockchain
 * @access Private
 */
router.post(
  '/:tokenAddress/deploy',
  authenticate,
  TokenController.deployToken
);

/**
 * @route POST /api/tokens/:tokenAddress/trading
 * @desc Setup trading on Pump.fun
 * @access Private
 */
router.post(
  '/:tokenAddress/trading',
  authenticate,
  [
    body('initialPrice').isNumeric().withMessage('Initial price is required'),
    body('liquidityAmount').isNumeric().withMessage('Liquidity amount is required'),
  ],
  validateRequest,
  TokenController.setupTokenTrading
);

export default router; 