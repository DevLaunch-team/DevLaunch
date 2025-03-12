import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateJWT } from '../middleware/auth';
import * as githubController from '../controllers/githubController';

const router = Router();

/**
 * @swagger
 * /github/login:
 *   get:
 *     summary: Redirect to GitHub OAuth login page
 *     description: Initiates the GitHub OAuth flow by redirecting the user to GitHub login page
 *     tags: [GitHub]
 *     responses:
 *       302:
 *         description: Redirects to GitHub login page
 */
router.get('/login', githubController.githubLogin);

/**
 * @swagger
 * /github/link:
 *   get:
 *     summary: Get GitHub OAuth link
 *     description: Get a link to authorize the app with GitHub OAuth
 *     tags: [GitHub]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: GitHub authorization URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GitHubLinkResponse'
 *       401:
 *         description: Not authenticated
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
router.get('/link', authenticateJWT, githubController.getGitHubAuthLink);

/**
 * @swagger
 * /github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     description: Callback endpoint for GitHub OAuth flow
 *     tags: [GitHub]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State parameter for security verification
 *     responses:
 *       302:
 *         description: Redirects to frontend with success/error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/callback', githubController.handleGitHubCallback);

/**
 * @swagger
 * /github/user:
 *   get:
 *     summary: Get GitHub user profile
 *     description: Get the current user's GitHub profile
 *     tags: [GitHub]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: GitHub user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/GitHubUser'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: GitHub account not linked
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
router.get('/user', authenticateJWT, githubController.getGitHubUser);

/**
 * @swagger
 * /github/repos:
 *   get:
 *     summary: Get GitHub repositories
 *     description: Get the current user's GitHub repositories
 *     tags: [GitHub]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of GitHub repositories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 repos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GitHubRepository'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: GitHub account not linked
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
router.get('/repos', authenticateJWT, githubController.getGitHubRepos);

/**
 * @swagger
 * /github/unlink:
 *   post:
 *     summary: Unlink GitHub account
 *     description: Remove GitHub connection from user account
 *     tags: [GitHub]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: GitHub account unlinked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
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
router.post('/unlink', authenticateJWT, githubController.unlinkGitHub);

export default router; 