import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { 
  createToken, 
  getAllTokens, 
  getTokenById, 
  getTokenByAddress, 
  updateToken, 
  getTokensByCreator,
  searchTokens
} from '../controllers/tokenController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /tokens:
 *   get:
 *     summary: Get all tokens
 *     description: Retrieve a list of all tokens with pagination
 *     tags: [Tokens]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, deployed, trading, delisted]
 *         description: Filter by token status
 *       - in: query
 *         name: creator
 *         schema:
 *           type: string
 *         description: Filter by creator ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by token category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or symbol
 *     responses:
 *       200:
 *         description: A list of tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Token'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllTokens);

/**
 * @swagger
 * /tokens/me:
 *   get:
 *     summary: Get authenticated user's tokens
 *     description: Retrieve all tokens created by the authenticated user
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user's tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Token'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authenticateJWT, getTokensByCreator);

/**
 * @swagger
 * /tokens:
 *   post:
 *     summary: Create a new token
 *     description: Create a new token with the specified details
 *     tags: [Tokens]
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
 *               - tokenAddress
 *             properties:
 *               name:
 *                 type: string
 *                 description: Token name
 *               symbol:
 *                 type: string
 *                 description: Token symbol
 *               description:
 *                 type: string
 *                 description: Token description
 *               category:
 *                 type: string
 *                 description: Token category
 *               tokenAddress:
 *                 type: string
 *                 description: Token address on Solana
 *               supply:
 *                 type: number
 *                 description: Token total supply
 *               decimals:
 *                 type: integer
 *                 description: Token decimals
 *               logo:
 *                 type: string
 *                 description: URL to token logo
 *               website:
 *                 type: string
 *                 description: Token website URL
 *               twitter:
 *                 type: string
 *                 description: Token Twitter profile URL
 *               discord:
 *                 type: string
 *                 description: Token Discord server URL
 *     responses:
 *       201:
 *         description: Token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   $ref: '#/components/schemas/Token'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authenticateJWT,
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('symbol').isString().notEmpty().withMessage('Symbol is required'),
    body('tokenAddress').isString().notEmpty().withMessage('Token address is required'),
    validateRequest
  ],
  createToken
);

/**
 * @swagger
 * /tokens/{id}:
 *   get:
 *     summary: Get token by ID
 *     description: Retrieve token details by ID or token address
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Token ID or token address
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   $ref: '#/components/schemas/Token'
 *       404:
 *         description: Token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getTokenById);

/**
 * @swagger
 * /tokens/{id}:
 *   put:
 *     summary: Update token
 *     description: Update token details
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Token ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               supply:
 *                 type: number
 *               decimals:
 *                 type: integer
 *               logo:
 *                 type: string
 *               website:
 *                 type: string
 *               twitter:
 *                 type: string
 *               discord:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   $ref: '#/components/schemas/Token'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  '/:id',
  authenticateJWT,
  [
    param('id').isString().notEmpty().withMessage('Token ID is required'),
    validateRequest
  ],
  updateToken
);

/**
 * @swagger
 * /tokens/{id}:
 *   delete:
 *     summary: Delete token
 *     description: Delete a token (only if not deployed)
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Token ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete deployed token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  '/:id',
  authenticateJWT,
  [
    param('id').isString().notEmpty().withMessage('Token ID is required'),
    validateRequest
  ],
  deleteToken
);

/**
 * @swagger
 * /tokens/search:
 *   get:
 *     summary: Search tokens
 *     description: Search tokens by name, symbol, or description
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
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
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Token'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Invalid search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/search',
  [
    query('query').isString().notEmpty().withMessage('Search query cannot be empty'),
    validateRequest
  ],
  searchTokens
);

/**
 * @swagger
 * /tokens/users/{userId}:
 *   get:
 *     summary: Get tokens by user
 *     description: Get all tokens created by a specific user
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Token'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/users/:userId',
  [
    param('userId').isString().notEmpty().withMessage('User ID is required'),
    validateRequest
  ],
  getTokensByCreator
);

export default router; 