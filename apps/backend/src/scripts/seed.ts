import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { UserModel } from '../models/user.model';
import { TokenModel } from '../models/token.model';
import logger from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/devlaunch';
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connection successful');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Clear database
const clearDatabase = async () => {
  logger.info('Clearing database...');
  await UserModel.deleteMany({});
  await TokenModel.deleteMany({});
};

// Create test users
const createUsers = async () => {
  logger.info('Creating test users...');
  
  const users = [
    {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      walletAddress: 'GZNrABtaBVyJYdJYDEcSFfUfPCEZpnfJbZcBZMo9DaCc',
      bio: 'Test user bio',
      verificationLevel: 2,
      createdAt: new Date()
    },
    {
      email: 'dev@example.com',
      password: 'password123',
      username: 'developer',
      walletAddress: 'AvrjQJhvGQnnAYUH1EJrvvFJKmzuYDdNTwMy4sBnTLGr',
      bio: 'I am a Solana developer',
      githubUsername: 'solanadeveloper',
      verificationLevel: 3,
      createdAt: new Date()
    },
    {
      email: 'admin@devlaunch.fun',
      password: 'adminPass123',
      username: 'adminuser',
      walletAddress: 'DmMTcvXeTAp9fwMwHPkKUCCKvtKYsJ4PHW9fGmYS3YKB',
      verificationLevel: 5,
      createdAt: new Date()
    }
  ];
  
  const createdUsers = await UserModel.create(users);
  logger.info(`Created ${createdUsers.length} users`);
  return createdUsers;
};

// Create test tokens
const createTokens = async (users: any[]) => {
  logger.info('Creating test tokens...');
  
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  
  const tokens = [
    {
      name: 'DevLaunch Token',
      symbol: 'DVL',
      tokenAddress: 'DVLtokB19MvBDLEswEGj6ex3nqQx7Snjr5XLwY9Dtiz',
      creator: users[0]._id,
      creatorWallet: users[0].walletAddress,
      description: 'DevLaunch platform official token',
      totalSupply: 1000000000,
      decimals: 9,
      logoUrl: 'https://example.com/devlaunch-logo.png',
      websiteUrl: 'https://devlaunch.fun',
      socialLinks: {
        twitter: 'https://twitter.com/devlaunch',
        telegram: 'https://t.me/devlaunch',
        discord: 'https://discord.gg/devlaunch',
        github: 'https://github.com/devlaunch'
      },
      tags: ['Platform', 'Utility', 'DEX'],
      launchDate: new Date(now.getTime() - 30 * oneDay), // 30 days ago
      createdAt: new Date(now.getTime() - 30 * oneDay),
      verified: true,
      marketData: {
        price: 0.015,
        marketCap: 15000000,
        volume24h: 1250000,
        priceChange24h: 5.2
      }
    },
    {
      name: 'Test Project Token',
      symbol: 'TPT',
      tokenAddress: 'TPTRFhnbCDDQtisRmogwWdPfZZvJP63wEShNn8nQCRs',
      creator: users[1]._id,
      creatorWallet: users[1].walletAddress,
      description: 'Test project token for demonstration purposes',
      totalSupply: 500000000,
      decimals: 9,
      logoUrl: 'https://example.com/tpt-logo.png',
      websiteUrl: 'https://testproject.dev',
      socialLinks: {
        twitter: 'https://twitter.com/testproject',
        github: 'https://github.com/testproject'
      },
      tags: ['Test', 'Demo'],
      launchDate: new Date(now.getTime() - 7 * oneDay), // 7 days ago
      createdAt: new Date(now.getTime() - 7 * oneDay),
      verified: true,
      marketData: {
        price: 0.005,
        marketCap: 2500000,
        volume24h: 350000,
        priceChange24h: -2.5
      }
    },
    {
      name: 'New Game Token',
      symbol: 'NGT',
      tokenAddress: 'NGT5XurR8nvQKLXcHNzzP4YzJmSgXbDwN8QZvZdjHcw',
      creator: users[2]._id,
      creatorWallet: users[2].walletAddress,
      description: 'A new gaming project token based on Solana',
      totalSupply: 100000000,
      decimals: 6,
      logoUrl: 'https://example.com/ngt-logo.png',
      websiteUrl: 'https://newgame.io',
      socialLinks: {
        twitter: 'https://twitter.com/newgame',
        discord: 'https://discord.gg/newgame'
      },
      tags: ['Gaming', 'NFT', 'Metaverse'],
      launchDate: new Date(now.getTime() + 7 * oneDay), // 7 days in future
      createdAt: new Date(),
      verified: false
    }
  ];
  
  const createdTokens = await TokenModel.create(tokens);
  logger.info(`Created ${createdTokens.length} tokens`);
  
  // Update user tokens array
  await UserModel.findByIdAndUpdate(users[0]._id, {
    $push: { tokens: tokens[0].tokenAddress }
  });
  
  await UserModel.findByIdAndUpdate(users[1]._id, {
    $push: { tokens: tokens[1].tokenAddress }
  });
  
  await UserModel.findByIdAndUpdate(users[2]._id, {
    $push: { tokens: tokens[2].tokenAddress }
  });
};

// Main function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();
    const users = await createUsers();
    await createTokens(users);
    
    logger.info('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Database seed script failed:', error);
    process.exit(1);
  }
};

// Execute seed script
seedDatabase(); 