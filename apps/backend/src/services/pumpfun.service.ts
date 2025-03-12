import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';
import { validateSolanaAddress } from '../utils/validators';

// Configuration
const API_BASE_URL = config.pumpfun.apiBaseUrl;
const API_KEY = config.pumpfun.apiKey;

// Pump.fun API client
const pumpfunClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
});

// Error interceptor
pumpfunClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      logger.error('Pump.fun API error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      logger.error('Pump.fun API request error:', error.message);
    } else {
      logger.error('Pump.fun API setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Transform token data from API format to application format
 */
const transformTokenData = (token: any) => {
  return {
    address: token.token_address,
    name: token.name || 'Unknown',
    symbol: token.symbol || '???',
    price: token.price,
    priceChange24h: token.price_change_24h,
    liquidity: token.liquidity,
    volume24h: token.volume_24h,
    marketCap: token.market_cap,
    createdAt: token.created_at ? new Date(token.created_at) : null
  };
};

/**
 * Transform trade data from API format to application format
 */
const transformTradeData = (trade: any) => {
  return {
    id: trade.id,
    tokenAddress: trade.token_address,
    tokenSymbol: trade.token_symbol || 'Unknown',
    type: trade.type, // buy or sell
    amount: trade.amount,
    price: trade.price,
    value: trade.value,
    walletAddress: trade.wallet_address,
    timestamp: trade.timestamp ? new Date(trade.timestamp) : null
  };
};

/**
 * Validate token address
 */
const validateTokenAddress = (address: string) => {
  if (!validateSolanaAddress(address)) {
    throw new Error('Invalid Solana token address');
  }
};

/**
 * Validate wallet address
 */
const validateWalletAddress = (address: string) => {
  if (!validateSolanaAddress(address)) {
    throw new Error('Invalid Solana wallet address');
  }
};

/**
 * Create trading pair
 * @param tokenAddress Token address
 * @param initialPrice Initial price (unit: SOL)
 * @param liquidityAmount Liquidity amount (unit: SOL)
 * @param creatorWallet Creator wallet address
 */
const createTradingPair = async (
  tokenAddress: string,
  initialPrice: number,
  liquidityAmount: number,
  creatorWallet: string
) => {
  try {
    validateTokenAddress(tokenAddress);
    validateWalletAddress(creatorWallet);
    
    logger.info(`Creating trading pair for token ${tokenAddress}, initial price: ${initialPrice} SOL`);
    
    const response = await pumpfunClient.post('/pairs/create', {
      token_address: tokenAddress,
      initial_price: initialPrice,
      liquidity_amount: liquidityAmount,
      creator_wallet: creatorWallet
    });
    
    logger.info(`Trading pair created successfully, ID: ${response.data.pair_id}`);
    
    return {
      success: true,
      pairId: response.data.pair_id,
      tokenAddress,
      initialPrice,
      liquidityAmount
    };
  } catch (error: any) {
    logger.error('Failed to create trading pair:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    };
  }
};

/**
 * Get token price information
 * @param tokenAddress Token address
 */
const getTokenPrice = async (tokenAddress: string) => {
  try {
    validateTokenAddress(tokenAddress);
    logger.info(`Getting price information for token ${tokenAddress}`);
    
    const response = await pumpfunClient.get(`/tokens/${tokenAddress}/price`);
    
    return {
      success: true,
      price: response.data.price,
      priceChange24h: response.data.price_change_24h,
      liquidity: response.data.liquidity,
      volume24h: response.data.volume_24h,
      marketCap: response.data.market_cap
    };
  } catch (error: any) {
    logger.error('Failed to get token price:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    };
  }
};

/**
 * Get token trade history
 * @param tokenAddress Token address
 * @param limit Maximum number of trades to return
 */
const getTokenTrades = async (tokenAddress: string, limit: number = 20) => {
  try {
    validateTokenAddress(tokenAddress);
    logger.info(`Getting trade history for token ${tokenAddress}, limit: ${limit}`);
    
    const response = await pumpfunClient.get(`/tokens/${tokenAddress}/trades`, {
      params: { limit }
    });
    
    return {
      success: true,
      trades: Array.isArray(response.data.trades) 
        ? response.data.trades.map(transformTradeData)
        : []
    };
  } catch (error: any) {
    logger.error('Failed to get token trade history:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    };
  }
};

/**
 * Get user trade history
 * @param walletAddress User wallet address
 * @param limit Maximum number of trades to return
 */
const getUserTrades = async (walletAddress: string, limit: number = 20) => {
  try {
    validateWalletAddress(walletAddress);
    logger.info(`Getting trade history for user ${walletAddress}, limit: ${limit}`);
    
    const response = await pumpfunClient.get(`/users/${walletAddress}/trades`, {
      params: { limit }
    });
    
    return {
      success: true,
      trades: Array.isArray(response.data.trades) 
        ? response.data.trades.map(transformTradeData)
        : []
    };
  } catch (error: any) {
    logger.error('Failed to get user trade history:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    };
  }
};

/**
 * Get trending tokens list
 * @param limit Maximum number of tokens to return
 */
const getTrendingTokens = async (limit: number = 10) => {
  try {
    logger.info(`Getting trending tokens list, limit: ${limit}`);
    
    const response = await pumpfunClient.get('/tokens/trending', {
      params: { limit }
    });
    
    return {
      success: true,
      tokens: Array.isArray(response.data.tokens)
        ? response.data.tokens.map(transformTokenData)
        : []
    };
  } catch (error: any) {
    logger.error('Failed to get trending tokens list:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Unknown error'
    };
  }
};

export default {
  createTradingPair,
  getTokenPrice,
  getTokenTrades,
  getUserTrades,
  getTrendingTokens
}; 