import { Request, Response } from 'express';
import axios from 'axios';
import { Octokit } from 'octokit';
import { createLogger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import githubConfig from '../config/github';
import crypto from 'crypto';
import User from '../models/User';
import { CustomRequest } from '../middleware/auth';

const logger = createLogger('githubController');

// GitHub OAuth app credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:8000/api/github/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'devlaunch_secret_key';

// GitHub API URLs
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_URL = 'https://api.github.com';

// Frontend URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Redirect to GitHub OAuth login
 */
export const redirectToGitHubLogin = (req: Request, res: Response) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}&scope=read:user,repo,user:email`;
  res.redirect(githubAuthUrl);
};

/**
 * Handle GitHub OAuth callback
 */
export const handleGitHubCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/settings?error=GitHub authorization failed`);
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      GITHUB_TOKEN_URL,
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
        state
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.redirect(`${FRONTEND_URL}/settings?error=Failed to get GitHub access token`);
    }

    // Get GitHub user data
    const userResponse = await axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `token ${access_token}`
      }
    });

    const githubUser = userResponse.data;

    // Check if this GitHub account is already linked to another user
    const existingUser = await User.findOne({ githubId: githubUser.id.toString() });

    if (existingUser) {
      // Update existing user's GitHub access token
      existingUser.githubAccessToken = access_token;
      await existingUser.save();

      return res.redirect(`${FRONTEND_URL}/settings?success=GitHub account updated`);
    }

    // Store the access token in the session for later use
    // In a real application, you would get the user ID from a JWT token or session
    // and update the corresponding user record

    // For now, redirect to frontend with the GitHub data in query parameters
    return res.redirect(
      `${FRONTEND_URL}/github/complete?token=${access_token}&githubId=${githubUser.id}&githubUsername=${githubUser.login}`
    );
  } catch (error) {
    logger.error(`Error handling GitHub callback: ${error}`);
    return res.redirect(`${FRONTEND_URL}/settings?error=GitHub authorization failed`);
  }
};

/**
 * Get GitHub user profile
 */
export const getGitHubUser = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find user with GitHub info
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.githubAccessToken) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not linked'
      });
    }

    // Get GitHub user data
    const response = await axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `token ${user.githubAccessToken}`
      }
    });

    res.json({
      success: true,
      user: response.data
    });
  } catch (error) {
    logger.error(`Error getting GitHub user: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error getting GitHub user'
    });
  }
};

/**
 * Get GitHub repositories
 */
export const getGitHubRepos = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find user with GitHub info
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.githubAccessToken) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not linked'
      });
    }

    // Get GitHub repositories
    const response = await axios.get(`${GITHUB_API_URL}/user/repos`, {
      headers: {
        Authorization: `token ${user.githubAccessToken}`
      },
      params: {
        sort: 'updated',
        per_page: 100
      }
    });

    res.json({
      success: true,
      repos: response.data
    });
  } catch (error) {
    logger.error(`Error getting GitHub repos: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error getting GitHub repositories'
    });
  }
};

/**
 * Unlink GitHub account
 */
export const unlinkGitHub = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove GitHub info
    user.githubId = undefined;
    user.githubUsername = undefined;
    user.githubAccessToken = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'GitHub account unlinked successfully'
    });
  } catch (error) {
    logger.error(`Error unlinking GitHub account: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error unlinking GitHub account'
    });
  }
};

/**
 * Legacy GitHub login (for backward compatibility)
 */
export const githubLogin = (req: Request, res: Response) => {
  const authUrl = `${GITHUB_AUTH_URL}?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_CALLBACK_URL)}&scope=read:user,user:email,repo`;
  res.redirect(authUrl);
};

/**
 * Get GitHub authorization link
 * @route GET /api/github/link
 * @access Private
 */
export const getGitHubAuthLink = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Generate a random state parameter for security
    const state = crypto.randomBytes(16).toString('hex');

    // Create authorization URL
    const authUrl = `${GITHUB_AUTH_URL}?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_CALLBACK_URL)}&state=${state}&scope=read:user,user:email,repo`;

    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    logger.error(`Error getting GitHub auth link: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Link GitHub account to existing user
 * @route POST /api/github/link
 * @access Private
 */
export const linkGithubAccount = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { token, githubId, githubUsername } = req.body;

    if (!token || !githubId || !githubUsername) {
      return res.status(400).json({
        success: false,
        message: 'GitHub token, ID, and username are required'
      });
    }

    // Check if this GitHub account is already linked to another user
    const existingUser = await User.findOne({ githubId: githubId.toString() });

    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'This GitHub account is already linked to another user'
      });
    }

    // Find and update user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user with GitHub info
    user.githubId = githubId.toString();
    user.githubUsername = githubUsername;
    user.githubAccessToken = token;

    await user.save();

    res.json({
      success: true,
      message: 'GitHub account linked successfully',
      githubUsername
    });
  } catch (error) {
    logger.error(`Error linking GitHub account: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error linking GitHub account'
    });
  }
};

/**
 * Get GitHub user activity statistics
 */
export const getUserStatistics = async (req: Request, res: Response) => {
  try {
    // This would typically use middleware to extract user from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const githubToken = decoded.github_token;
    const username = decoded.login;
    
    // Get user events from GitHub
    const octokit = new Octokit({ auth: githubToken });
    
    // Get events (limited to recent events by GitHub API)
    const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
      username,
      per_page: 100,
    });
    
    // Get user public repos
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 100,
    });
    
    // Calculate basic stats
    const stats = {
      totalPublicRepos: repos.length,
      stargazersCount: repos.reduce((acc, repo) => acc + repo.stargazers_count, 0),
      forksCount: repos.reduce((acc, repo) => acc + repo.forks_count, 0),
      mostPopularRepos: repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .map(repo => ({
          name: repo.name,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
        })),
      recentActivity: events.slice(0, 20).map(event => ({
        type: event.type,
        repo: event.repo.name,
        createdAt: event.created_at,
      })),
    };
    
    res.status(200).json({ success: true, stats });
  } catch (error: any) {
    logger.error('Error fetching user statistics', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
};

/**
 * Verify GitHub identity
 */
export const verifyGitHubIdentity = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    // This would typically use middleware to extract user from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const githubToken = decoded.github_token;
    
    // Verify that the authenticated user matches the requested username
    if (decoded.login.toLowerCase() !== username.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Username verification failed' });
    }
    
    // Calculate reputation score
    const score = await calculateReputationScore(username, githubToken);
    
    res.status(200).json({
      success: true,
      verified: true,
      username,
      reputationScore: score,
    });
  } catch (error: any) {
    logger.error('Error verifying GitHub identity', { error: error.message });
    res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
  }
};

/**
 * Get developer reputation score
 */
export const getDeveloperReputation = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    // Check if username is valid
    try {
      const octokit = new Octokit();
      await octokit.rest.users.getByUsername({ username });
    } catch (error) {
      return res.status(404).json({ success: false, message: 'GitHub user not found' });
    }
    
    // Get reputation score
    const score = await calculateReputationScore(username);
    
    res.status(200).json({
      success: true,
      username,
      reputationScore: score,
    });
  } catch (error: any) {
    logger.error('Error getting developer reputation', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get reputation', error: error.message });
  }
};

/**
 * Calculate developer reputation score
 * This is a simplified example - in a real app, this would be more comprehensive
 */
const calculateReputationScore = async (username: string, token?: string): Promise<number> => {
  try {
    const octokit = token ? new Octokit({ auth: token }) : new Octokit();
    
    // Get user data
    const { data: user } = await octokit.rest.users.getByUsername({ username });
    
    // Get repositories
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      per_page: 100,
      sort: 'updated',
    });
    
    // Basic factors for score calculation
    const accountAge = (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365); // In years
    const publicRepos = repos.length;
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);
    const hasReadme = await Promise.all(
      repos.slice(0, 10).map(async repo => {
        try {
          await octokit.rest.repos.getReadme({
            owner: username,
            repo: repo.name,
          });
          return true;
        } catch {
          return false;
        }
      })
    );
    const readmePercentage = hasReadme.filter(Boolean).length / (hasReadme.length || 1);
    
    // Calculate score using weighted factors
    const score = 
      (accountAge * 5) + // 5 points per year (max 50)
      (publicRepos * 2) + // 2 points per repo (max 100)
      (totalStars * 0.5) + // 0.5 points per star
      (totalForks * 1) + // 1 point per fork
      (readmePercentage * 20) + // Up to 20 points for documentation
      (user.bio ? 5 : 0) + // 5 points for having a bio
      (user.blog ? 5 : 0) + // 5 points for having a website
      (user.twitter_username ? 5 : 0); // 5 points for having Twitter
    
    // Normalize score to 0-100 range with a cap at 100
    return Math.min(Math.round(score), 100);
  } catch (error) {
    logger.error('Error calculating reputation score', { error });
    return 0; // Return 0 if calculation fails
  }
};

/**
 * GitHub OAuth Authentication Controller
 */

/**
 * Redirects to GitHub OAuth login page
 */
export const githubLogin = (req: Request, res: Response) => {
  const { clientId, scope, callbackUrl } = githubConfig;
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${scope.join('%20')}`;
  
  res.redirect(githubAuthUrl);
};

/**
 * Handles GitHub OAuth callback
 */
export const githubCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is missing' });
    }
    
    // Exchange the code for an access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
        redirect_uri: githubConfig.callbackUrl,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(400).json({ success: false, message: 'Failed to obtain access token' });
    }
    
    // Get user profile information
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': githubConfig.userAgent,
      },
    });
    
    const githubUser = userResponse.data;
    
    // Get user's email
    const emailsResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': githubConfig.userAgent,
      },
    });
    
    // Find primary email
    const primaryEmail = emailsResponse.data.find((email: any) => email.primary)?.email || emailsResponse.data[0]?.email;
    
    if (!primaryEmail) {
      return res.status(400).json({ success: false, message: 'Unable to retrieve email from GitHub' });
    }
    
    // Check if user exists
    let user = await UserModel.findOne({ email: primaryEmail });
    
    if (user) {
      // Update GitHub username if not set or different
      if (!user.githubUsername || user.githubUsername !== githubUser.login) {
        user.githubUsername = githubUser.login;
        await user.save();
      }
    } else {
      // Create a new user
      user = await UserModel.create({
        email: primaryEmail,
        username: githubUser.login,
        githubUsername: githubUser.login,
        verificationLevel: 2, // GitHub verified
        bio: githubUser.bio || '',
        avatarUrl: githubUser.avatar_url,
        createdAt: new Date()
      });
    }
    
    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'devlaunch-secret-key';
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Redirect to frontend with token
    const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/github-callback?token=${token}`;
    
    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error('GitHub authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'GitHub authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Links existing account with GitHub
 */
export const linkGithubAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is missing' });
    }
    
    // Exchange the code for an access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );
    
    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(400).json({ success: false, message: 'Failed to obtain access token' });
    }
    
    // Get user profile information
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': githubConfig.userAgent,
      },
    });
    
    const githubUser = userResponse.data;
    
    // Update user's GitHub information
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.githubUsername = githubUser.login;
    
    // Increase verification level if not already higher
    if (user.verificationLevel < 2) {
      user.verificationLevel = 2;
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'GitHub account linked successfully',
      githubUsername: user.githubUsername,
      verificationLevel: user.verificationLevel
    });
  } catch (error) {
    logger.error('GitHub account linking error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to link GitHub account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 