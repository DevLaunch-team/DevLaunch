/**
 * Application configuration
 */
export default {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/devlaunch',
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'devlaunch-secret-key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  // Solana configuration
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
  },
  
  // Pump.fun API configuration
  pumpfun: {
    apiBaseUrl: process.env.PUMPFUN_API_URL || 'https://api.pump.fun/v1',
    apiKey: process.env.PUMPFUN_API_KEY || '',
  },
  
  // GitHub configuration
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/github/callback',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
}; 