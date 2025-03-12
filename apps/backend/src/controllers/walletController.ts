import { Request, Response } from 'express';
import * as web3 from '@solana/web3.js';
import User from '../models/User';
import * as solanaUtils from '../utils/solana';
import logger from '../utils/logger';
import { CustomRequest } from '../middleware/auth';
import TokenModel from '../models/token.model';
import Transaction from '../models/transaction.model';

/**
 * Get wallet balance
 * @route GET /api/wallet/balance
 * @access Private
 */
export const getWalletBalance = async (req: CustomRequest, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a wallet address
    if (!user.walletAddress || !solanaUtils.validateSolanaAddress(user.walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a valid wallet address'
      });
    }

    // Get SOL balance
    const balance = await solanaUtils.getSolBalance(user.walletAddress);

    res.json({
      success: true,
      balance,
      walletAddress: user.walletAddress
    });
  } catch (error) {
    logger.error(`Error getting wallet balance: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while getting wallet balance'
    });
  }
};

/**
 * Get token balance
 * @route GET /api/wallet/token-balance/:tokenAddress
 * @access Private
 */
export const getTokenBalance = async (req: CustomRequest, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const tokenAddress = req.params.tokenAddress;

    // Validate token address
    if (!solanaUtils.validateSolanaAddress(tokenAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token address'
      });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a wallet address
    if (!user.walletAddress || !solanaUtils.validateSolanaAddress(user.walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a valid wallet address'
      });
    }

    // Get token balance
    const balance = await solanaUtils.getTokenBalance(user.walletAddress, tokenAddress);

    res.json({
      success: true,
      balance,
      tokenAddress,
      walletAddress: user.walletAddress
    });
  } catch (error) {
    logger.error(`Error getting token balance: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while getting token balance'
    });
  }
};

/**
 * Validate Solana address
 * @route POST /api/wallet/validate-address
 * @access Public
 */
export const validateAddress = async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    // Validate address
    const isValid = solanaUtils.validateSolanaAddress(address);

    res.json({
      success: true,
      isValid,
      address
    });
  } catch (error) {
    logger.error(`Error validating address: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while validating address'
    });
  }
};

/**
 * Create SPL token
 * @route POST /api/wallet/create-token
 * @access Private
 */
export const createToken = async (req: CustomRequest, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { name, symbol, decimals = 9, initialSupply = 1000000000 } = req.body;

    // Get user from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a wallet address
    if (!user.walletAddress || !solanaUtils.validateSolanaAddress(user.walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a valid wallet address'
      });
    }

    // In a real app, you would use user's private key to create token
    // For this example, we'll use admin keypair from environment variables
    const adminKeypair = solanaUtils.getAdminKeypair();
    
    if (!adminKeypair) {
      return res.status(500).json({
        success: false,
        message: 'Admin keypair not available'
      });
    }

    // Create token
    const result = await solanaUtils.createToken(adminKeypair, decimals, initialSupply);

    // Save token information to database
    const token = new TokenModel({
      name,
      symbol,
      tokenAddress: result.tokenAddress,
      creator: user._id,
      creatorWallet: user.walletAddress,
      description: `Token created by ${user.username}`,
      totalSupply: initialSupply,
      decimals,
      launchDate: new Date(),
      metadata: {
        name,
        symbol,
        description: `Token created by ${user.username}`
      }
    });

    await token.save();

    res.status(201).json({
      success: true,
      tokenAddress: result.tokenAddress,
      txSignature: result.txSignature,
      name,
      symbol
    });
  } catch (error) {
    logger.error(`Error creating token: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while creating token'
    });
  }
};

/**
 * Get token info
 * @route GET /api/wallet/token-info/:tokenAddress
 * @access Public
 */
export const getTokenInfo = async (req: Request, res: Response) => {
  try {
    const tokenAddress = req.params.tokenAddress;

    // Validate token address
    if (!solanaUtils.validateSolanaAddress(tokenAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token address'
      });
    }

    // Get token info from database
    const tokenFromDb = await TokenModel.findOne({ tokenAddress })
      .populate('creator', 'username email');

    // Get on-chain token info
    const tokenInfo = await solanaUtils.getTokenInfo(tokenAddress);

    // Combine database and on-chain info
    const combinedInfo = {
      ...tokenInfo,
      name: tokenFromDb?.name || 'Unknown',
      symbol: tokenFromDb?.symbol || 'UNKNOWN',
      creator: tokenFromDb?.creator || null,
      description: tokenFromDb?.description || '',
      launchDate: tokenFromDb?.launchDate || null
    };

    res.json({
      success: true,
      tokenInfo: combinedInfo
    });
  } catch (error) {
    logger.error(`Error getting token info: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while getting token info'
    });
  }
};

/**
 * Get transaction history
 * @route GET /api/wallet/transactions
 * @access Private
 */
export const getTransactionHistory = async (req: CustomRequest, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const transactionType = req.query.type as string;
    const status = req.query.status as string;

    // Build query
    const query: any = { sender: req.user.id };
    
    if (transactionType) {
      query.transactionType = transactionType;
    }
    
    if (status) {
      query.status = status;
    }

    // Get transactions from database
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Error getting transaction history: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while getting transaction history'
    });
  }
};

/**
 * Transfer SOL to another wallet
 * @route POST /api/wallet/transfer-sol
 * @access Private
 */
export const transferSolToWallet = async (req: CustomRequest, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { recipientAddress, amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Validate recipient address
    if (!solanaUtils.validateSolanaAddress(recipientAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient address'
      });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For this example, we'll use admin keypair from environment variables
    // In a real app, you would use user's private key to transfer SOL
    const adminKeypair = solanaUtils.getAdminKeypair();
    
    if (!adminKeypair) {
      return res.status(500).json({
        success: false,
        message: 'Admin keypair not available'
      });
    }

    // Transfer SOL
    const txSignature = await solanaUtils.transferSol(recipientAddress, amount);

    // Save transaction to database
    const transaction = new Transaction({
      transactionType: 'sol-transfer',
      sender: user._id,
      senderWallet: adminKeypair.publicKey.toBase58(),
      recipient: recipientAddress,
      amount,
      txSignature,
      status: 'confirmed',
      network: process.env.SOLANA_NETWORK || 'devnet'
    });

    await transaction.save();

    res.json({
      success: true,
      txSignature,
      amount,
      recipientAddress
    });
  } catch (error) {
    logger.error(`Error transferring SOL: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while transferring SOL'
    });
  }
};

/**
 * Transfer SPL token to another wallet
 * @route POST /api/wallet/transfer-token
 * @access Private
 */
export const transferToken = async (req: CustomRequest, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { recipientAddress, tokenAddress, amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Validate addresses
    if (!solanaUtils.validateSolanaAddress(recipientAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient address'
      });
    }

    if (!solanaUtils.validateSolanaAddress(tokenAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token address'
      });
    }

    // Get user from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get token from database
    const token = await TokenModel.findOne({ tokenAddress });
    
    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    // For this example, we'll use admin keypair from environment variables
    // In a real app, you would use user's private key to transfer tokens
    const adminKeypair = solanaUtils.getAdminKeypair();
    
    if (!adminKeypair) {
      return res.status(500).json({
        success: false,
        message: 'Admin keypair not available'
      });
    }

    // Transfer token - we need to implement this function in solana.ts
    const txSignature = await solanaUtils.transferToken(
      adminKeypair,
      tokenAddress,
      recipientAddress,
      amount,
      token.decimals
    );

    // Save transaction to database
    const transaction = new Transaction({
      transactionType: 'token-transfer',
      sender: user._id,
      senderWallet: adminKeypair.publicKey.toBase58(),
      recipient: recipientAddress,
      amount,
      tokenAddress,
      tokenSymbol: token.symbol,
      txSignature,
      status: 'confirmed',
      network: process.env.SOLANA_NETWORK || 'devnet'
    });

    await transaction.save();

    res.json({
      success: true,
      txSignature,
      amount,
      recipientAddress,
      tokenAddress,
      tokenSymbol: token.symbol
    });
  } catch (error) {
    logger.error(`Error transferring token: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Server error while transferring token'
    });
  }
}; 