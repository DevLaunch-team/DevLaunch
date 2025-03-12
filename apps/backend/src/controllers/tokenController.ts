import { Request, Response } from 'express';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import {
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TokenAccountNotFoundError,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import axios from 'axios';
import { TokenModel } from '../models/token.model';
import { createLogger } from '../utils/logger';
import UserModel from '../models/user.model';
import { Types } from 'mongoose';
import { validateTokenMetadata } from '../utils/validators';
import { TokenStatus } from '../types/token.types';

const logger = createLogger('tokenController');
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

/**
 * Get all tokens
 * @route GET /api/tokens
 * @access Public
 */
export const getTokens = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filter: any = {};
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Creator filter
    if (req.query.creator) {
      filter.creator = req.query.creator;
    }
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Search by name or symbol
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { symbol: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const tokens = await TokenModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await TokenModel.countDocuments(filter);
    
    return res.json({
      tokens,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Failed to get token list:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get my tokens
 * @route GET /api/tokens/me
 * @access Private
 */
export const getMyTokens = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get user from database with tokens populated
    const user = await UserModel.findById(req.user.id)
      .populate({
        path: 'tokens',
        model: 'Token',
        options: { sort: { createdAt: -1 } }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json({ tokens: user.tokens || [] });
  } catch (error) {
    logger.error('Failed to get user tokens:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create token
 * @route POST /api/tokens
 * @access Private
 */
export const createToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get user from database
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure user has a wallet address
    if (!user.walletAddress) {
      return res.status(400).json({ message: 'User does not have an associated wallet address' });
    }
    
    const {
      name,
      symbol,
      description,
      category,
      tokenAddress,
      supply,
      decimals,
      logo,
      website,
      twitter,
      discord
    } = req.body;
    
    // Check if token address already exists
    const existingToken = await TokenModel.findOne({ tokenAddress });
    if (existingToken) {
      return res.status(400).json({ message: 'This token address already exists' });
    }
    
    // Validate token metadata
    const validationResult = validateTokenMetadata(req.body);
    if (!validationResult.valid) {
      return res.status(400).json({ 
        message: 'Invalid token metadata', 
        errors: validationResult.errors
      });
    }
    
    // Create new token
    const token = new TokenModel({
      name,
      symbol,
      description,
      category,
      tokenAddress,
      supply,
      decimals,
      creator: user._id,
      creatorWallet: user.walletAddress,
      logo,
      website,
      twitter,
      discord,
      status: TokenStatus.PENDING
    });
    
    // Save token
    await token.save();
    
    // Update user's token list
    if (!user.tokens) {
      user.tokens = [];
    }
    user.tokens.push(token._id);
    await user.save();
    
    return res.status(201).json({
      message: 'Token created successfully',
      token
    });
  } catch (error) {
    logger.error('Failed to create token:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update token
 * @route PUT /api/tokens/:id
 * @access Private
 */
export const updateToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.params;
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid token ID' });
    }
    
    // Find token
    const token = await TokenModel.findById(id);
    
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    // Check ownership
    if (token.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this token' });
    }
    
    // Check if token is already deployed
    if (token.status === TokenStatus.DEPLOYED) {
      // Only allow updating certain fields after deployment
      const allowedFields = ['description', 'logo', 'website', 'twitter', 'discord'];
      
      // Filter out fields that are not allowed to be updated
      const updates: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
      
      Object.assign(token, updates);
    } else {
      // Allow updating all fields if not deployed
      const {
        name,
        symbol,
        description,
        category,
        supply,
        decimals,
        logo,
        website,
        twitter,
        discord
      } = req.body;
      
      // Validate token metadata
      const validationResult = validateTokenMetadata(req.body);
      if (!validationResult.valid) {
        return res.status(400).json({ 
          message: 'Invalid token metadata', 
          errors: validationResult.errors
        });
      }
      
      // Update token fields
      Object.assign(token, {
        name,
        symbol,
        description,
        category,
        supply,
        decimals,
        logo,
        website,
        twitter,
        discord
      });
    }
    
    // Save updated token
    await token.save();
    
    return res.json({
      message: 'Token updated successfully',
      token
    });
  } catch (error) {
    logger.error('Failed to update token:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get token details
 * @route GET /api/tokens/:id
 * @access Public
 */
export const getTokenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if ID is ObjectId or tokenAddress
    let token;
    if (Types.ObjectId.isValid(id)) {
      token = await TokenModel.findById(id);
    } else {
      token = await TokenModel.findOne({ tokenAddress: id });
    }
    
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    return res.json({
      token
    });
  } catch (error) {
    logger.error('Failed to get token details:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete token
 * @route DELETE /api/tokens/:id
 * @access Private
 */
export const deleteToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.params;
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid token ID' });
    }
    
    // Find token
    const token = await TokenModel.findById(id);
    
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    
    // Check ownership or admin role
    if (token.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this token' });
    }
    
    // Check if token is deployed
    if (token.status === TokenStatus.DEPLOYED) {
      return res.status(400).json({ 
        message: 'Cannot delete a deployed token' 
      });
    }
    
    // Remove token from user's tokens array
    await UserModel.updateOne(
      { _id: token.creator },
      { $pull: { tokens: token._id } }
    );
    
    // Delete token
    await TokenModel.deleteOne({ _id: id });
    
    return res.json({
      message: 'Token deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete token:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get token by address
 */
export const getTokenByAddress = async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    
    // Validate public key format
    try {
      new PublicKey(tokenAddress);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid token address format' });
    }
    
    const token = await TokenModel.findOne({ address: tokenAddress })
      .populate('creator', 'username walletAddress');
    
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    
    // Get on-chain token info
    try {
      const mintInfo = await getMint(
        connection,
        new PublicKey(tokenAddress),
        'confirmed',
        TOKEN_PROGRAM_ID
      );
      
      return res.status(200).json({
        success: true,
        token: {
          ...token.toObject(),
          onChainData: {
            supply: mintInfo.supply.toString(),
            decimals: mintInfo.decimals,
            isInitialized: mintInfo.isInitialized,
            freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
            mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
          }
        }
      });
    } catch (error: any) {
      // Return database info if on-chain data fetch fails
      logger.warn('Failed to fetch on-chain token data', { error: error.message, tokenAddress });
      return res.status(200).json({ success: true, token, onChainDataError: 'Failed to fetch on-chain data' });
    }
  } catch (error: any) {
    logger.error('Error fetching token', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch token', error: error.message });
  }
};

/**
 * Create trading pair on Pump.fun
 */
export const createTradingPair = async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    const { initialPrice, liquidityAmount } = req.body;
    
    // Check if token exists
    const token = await TokenModel.findOne({ address: tokenAddress });
    
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    
    // Integration with Pump.fun API would go here
    // This is a placeholder for the actual integration
    const pumpfunResponse = {
      success: true,
      pairId: `PUMP_${Date.now()}`,
      tokenAddress,
      initialPrice,
      liquidityAmount,
      tradingUrl: `https://pump.fun/token/${tokenAddress}`
    };
    
    // Update token with trading info
    token.tradingInfo = {
      pumpfunPairId: pumpfunResponse.pairId,
      tradingUrl: pumpfunResponse.tradingUrl,
      initialPrice,
      createdAt: new Date()
    };
    
    await token.save();
    
    return res.status(200).json({
      success: true,
      message: 'Trading pair created successfully',
      tradingInfo: token.tradingInfo
    });
  } catch (error: any) {
    logger.error('Error creating trading pair', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to create trading pair', error: error.message });
  }
};

/**
 * Get token statistics
 */
export const getTokenStats = async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    
    // Check if token exists
    const token = await TokenModel.findOne({ address: tokenAddress });
    
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    
    // This would typically include calls to trading APIs, analytics services, etc.
    // For now, we'll return placeholder data
    const stats = {
      price: {
        current: "0.0001",
        change24h: "+5.2%",
        ath: "0.00015",
        atl: "0.00005"
      },
      volume: {
        total: "1250000",
        h24: "25000"
      },
      liquidity: "45000",
      holders: 120,
      transactions: 350
    };
    
    return res.status(200).json({
      success: true,
      token: {
        name: token.name,
        symbol: token.symbol,
        address: token.address
      },
      stats
    });
  } catch (error: any) {
    logger.error('Error fetching token stats', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch token stats', error: error.message });
  }
};

/**
 * Update token metadata
 */
export const updateTokenMetadata = async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    const { metadata } = req.body;
    
    // Check if token exists
    const token = await TokenModel.findOne({ address: tokenAddress });
    
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    
    // Check ownership (in a real app, this would validate against the authenticated user)
    // if (token.owner !== req.user.address) {
    //   return res.status(403).json({ success: false, message: 'Not authorized to update this token' });
    // }
    
    // Update metadata
    token.metadata = { ...token.metadata, ...metadata };
    await token.save();
    
    return res.status(200).json({
      success: true,
      message: 'Token metadata updated successfully',
      token
    });
  } catch (error: any) {
    logger.error('Error updating token metadata', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to update token metadata', error: error.message });
  }
};

/**
 * Get tokens created by a user
 * @route GET /api/users/:userId/tokens
 * @access Public
 */
export const getUserTokens = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const tokens = await TokenModel.find({ creator: userId })
      .sort({ createdAt: -1 });
    
    return res.json({
      tokens
    });
  } catch (error) {
    logger.error('Failed to get user tokens:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search tokens
 * @route GET /api/tokens/search
 * @access Public
 */
export const searchTokens = async (req: Request, res: Response) => {
  try {
    const { query, category, sort, order, page, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query cannot be empty' });
    }
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const sortOption = sort || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    
    const sortOptions: any = {};
    sortOptions[sortOption as string] = sortOrder;
    
    // Build search filter
    const searchFilter: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { symbol: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Add category filter if provided
    if (category) {
      searchFilter.category = category;
    }
    
    const tokens = await TokenModel.find(searchFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const total = await TokenModel.countDocuments(searchFilter);
    
    return res.json({
      tokens,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    logger.error('Failed to search tokens:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 