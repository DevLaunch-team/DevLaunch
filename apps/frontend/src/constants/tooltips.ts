export const TOKEN_FORM_TOOLTIPS = {
  name: 'Your token full name, e.g. "Solana"',
  symbol: 'Your token trading symbol, e.g. "SOL"',
  decimals: 'Number of decimal places, typically 9',
  totalSupply: 'Initial token supply amount',
  description: 'Describe the purpose and functionality of your token',
  website: 'Project website URL',
  twitter: 'Twitter username',
  telegram: 'Telegram group or channel',
  github: 'GitHub username or organization'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TOKENS: '/tokens',
  TOKEN_DETAILS: (address: string) => `/token/${address}`,
  CREATE_TOKEN: '/create-token',
  TRANSFERS: '/transfers', 
  TRANSACTIONS: '/transactions',
  WALLET: '/wallet',
  ABOUT: '/about',
  CONTACT: '/contact'
};

export const ERROR_MESSAGES = {
  WALLET_CONNECTION_REQUIRED: 'Please connect your wallet first',
  UNAUTHORIZED: 'Unauthorized. Please login first',
  TOKEN_CREATE_FAILED: 'Failed to create token',
  GENERIC_ERROR: 'An error occurred'
};

export const SUCCESS_MESSAGES = {
  TOKEN_CREATED: 'Congratulations! Your token has been created successfully'
}; 