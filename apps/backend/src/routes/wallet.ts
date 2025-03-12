import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateJWT } from '../middleware/auth';
import * as walletController from '../controllers/walletController';
import { walletLimiter, strictLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     tags: [Wallet]
 *     summary: Get SOL balance
 *     description: Retrieve the SOL balance for authenticated user's wallet
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SolanaBalance'
 *       400:
 *         description: Invalid wallet address
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/balance', walletLimiter, authenticateJWT, walletController.getWalletBalance);

/**
 * @swagger
 * /wallet/token-balance/{tokenAddress}:
 *   get:
 *     tags: [Wallet]
 *     summary: Get token balance
 *     description: Retrieve the SPL token balance for authenticated user's wallet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: SPL token address
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenBalance'
 *       400:
 *         description: Invalid token address or wallet address
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get(
  '/token-balance/:tokenAddress',
  walletLimiter,
  authenticateJWT,
  [
    param('tokenAddress')
      .notEmpty()
      .withMessage('Token address is required')
      .isString()
      .withMessage('Token address must be a string'),
    validateRequest
  ],
  walletController.getTokenBalance
);

/**
 * @swagger
 * /wallet/validate-address:
 *   post:
 *     tags: [Wallet]
 *     summary: Validate Solana address
 *     description: Validate a Solana wallet address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: Solana wallet address to validate
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddressValidation'
 *       500:
 *         description: Server error
 */
router.post(
  '/validate-address',
  walletLimiter,
  [
    body('address')
      .notEmpty()
      .withMessage('Address is required')
      .isString()
      .withMessage('Address must be a string'),
    validateRequest
  ],
  walletController.validateAddress
);

/**
 * @swagger
 * /wallet/create-token:
 *   post:
 *     tags: [Wallet]
 *     summary: Create SPL token
 *     description: Create a new SPL token on Solana blockchain
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - symbol
 *             properties:
 *               name:
 *                 type: string
 *                 description: Token name
 *               symbol:
 *                 type: string
 *                 description: Token symbol
 *               decimals:
 *                 type: integer
 *                 description: Token decimals (default: 9)
 *                 default: 9
 *               initialSupply:
 *                 type: number
 *                 description: Initial token supply (default: 1000000000)
 *                 default: 1000000000
 *     responses:
 *       201:
 *         description: Token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenCreation'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post(
  '/create-token',
  strictLimiter,
  authenticateJWT,
  [
    body('name')
      .notEmpty()
      .withMessage('Token name is required')
      .isString()
      .withMessage('Token name must be a string')
      .isLength({ min: 2, max: 50 })
      .withMessage('Token name must be between 2 and 50 characters'),
    body('symbol')
      .notEmpty()
      .withMessage('Token symbol is required')
      .isString()
      .withMessage('Token symbol must be a string')
      .isLength({ min: 2, max: 10 })
      .withMessage('Token symbol must be between 2 and 10 characters'),
    body('decimals')
      .optional()
      .isInt({ min: 0, max: 9 })
      .withMessage('Decimals must be an integer between 0 and 9'),
    body('initialSupply')
      .optional()
      .isFloat({ min: 1 })
      .withMessage('Initial supply must be a positive number'),
    validateRequest
  ],
  walletController.createToken
);

/**
 * @swagger
 * /wallet/token-info/{tokenAddress}:
 *   get:
 *     tags: [Wallet]
 *     summary: Get token info
 *     description: Get information about a specific SPL token
 *     parameters:
 *       - in: path
 *         name: tokenAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: SPL token address
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenInfo'
 *       400:
 *         description: Invalid token address
 *       500:
 *         description: Server error
 */
router.get(
  '/token-info/:tokenAddress',
  walletLimiter,
  [
    param('tokenAddress')
      .notEmpty()
      .withMessage('Token address is required')
      .isString()
      .withMessage('Token address must be a string'),
    validateRequest
  ],
  walletController.getTokenInfo
);

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get transaction history
 *     description: Retrieve transaction history for authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [token-creation, sol-transfer, token-transfer, nft-transfer, token-mint]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, failed]
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionHistory'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get(
  '/transactions',
  walletLimiter,
  authenticateJWT,
  walletController.getTransactionHistory
);

/**
 * @swagger
 * /wallet/transfer-sol:
 *   post:
 *     tags: [Wallet]
 *     summary: Transfer SOL
 *     description: Transfer SOL to another wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientAddress
 *               - amount
 *             properties:
 *               recipientAddress:
 *                 type: string
 *                 description: Recipient wallet address
 *               amount:
 *                 type: number
 *                 description: Amount of SOL to transfer
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferResult'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post(
  '/transfer-sol',
  strictLimiter,
  authenticateJWT,
  [
    body('recipientAddress')
      .notEmpty()
      .withMessage('Recipient address is required')
      .isString()
      .withMessage('Recipient address must be a string'),
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 0.000001 })
      .withMessage('Amount must be a positive number'),
    validateRequest
  ],
  walletController.transferSolToWallet
);

/**
 * @swagger
 * /wallet/transfer-token:
 *   post:
 *     tags: [Wallet]
 *     summary: Transfer SPL token
 *     description: Transfer SPL token to another wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientAddress
 *               - tokenAddress
 *               - amount
 *             properties:
 *               recipientAddress:
 *                 type: string
 *                 description: Recipient wallet address
 *               tokenAddress:
 *                 type: string
 *                 description: SPL token address
 *               amount:
 *                 type: number
 *                 description: Amount of tokens to transfer
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenTransferResult'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post(
  '/transfer-token',
  strictLimiter,
  authenticateJWT,
  [
    body('recipientAddress')
      .notEmpty()
      .withMessage('Recipient address is required')
      .isString()
      .withMessage('Recipient address must be a string'),
    body('tokenAddress')
      .notEmpty()
      .withMessage('Token address is required')
      .isString()
      .withMessage('Token address must be a string'),
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 0.000001 })
      .withMessage('Amount must be a positive number'),
    validateRequest
  ],
  walletController.transferToken
);

export default router; 