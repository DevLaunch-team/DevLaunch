/**
 * GitHub OAuth Configuration
 */
export default {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/github/callback',
  scope: ['user:email', 'read:user'],
  userAgent: 'DevLaunch-App'
}; 