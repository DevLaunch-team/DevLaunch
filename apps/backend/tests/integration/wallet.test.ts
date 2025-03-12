import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import User from '../../src/models/User';
import TokenModel from '../../src/models/token.model';
import * as solanaUtils from '../../src/utils/solana';

// Mock Solana utilities
jest.mock('../../src/utils/solana', () => ({
  validateSolanaAddress: jest.fn().mockImplementation((address) => {
    // Simple mock for validation - any string longer than 32 chars is valid
    return address && address.length >= 32;
  }),
  getSolBalance: jest.fn().mockResolvedValue(5.5),
  getTokenBalance: jest.fn().mockResolvedValue(1000),
  getAdminKeypair: jest.fn().mockReturnValue({
    publicKey: {
      toBase58: () => 'AdminWalletAddress123456789012345678901234'
    }
  }),
  createToken: jest.fn().mockResolvedValue({
    tokenAddress: 'NewTokenAddress123456789012345678901234',
    txSignature: 'txSignature12345'
  }),
  getTokenInfo: jest.fn().mockResolvedValue({
    address: 'TokenAddress123456789012345678901234',
    supply: '1000000',
    decimals: 9
  })
}));

// Global test variables
let mongoServer: MongoMemoryServer;
let authToken: string;
let userId: string;
const validWalletAddress = 'SolanaWalletAddress123456789012345678901234';
const validTokenAddress = 'TokenAddress123456789012345678901234';

// Setup in-memory MongoDB server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear database and close connection
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear collections before each test
beforeEach(async () => {
  await User.deleteMany({});
  await TokenModel.deleteMany({});
  
  // Reset mocks between tests
  jest.clearAllMocks();
});

describe('Wallet API Integration Tests', () => {
  beforeEach(async () => {
    // Create test user with wallet address
    const userData = {
      email: 'wallet@example.com',
      password: 'password123',
      username: 'walletuser',
      walletAddress: validWalletAddress
    };

    // Create user directly
    const user = await User.create(userData);
    userId = user._id.toString();

    // Generate auth token (simulating login)
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: userData.email,
        password: userData.password,
      });

    authToken = res.body.token;
  });

  describe('GET /api/wallet/balance', () => {
    it('should return wallet SOL balance for authenticated user', async () => {
      const response = await request(app)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('balance', 5.5);
      expect(response.body).toHaveProperty('walletAddress', validWalletAddress);
      expect(solanaUtils.getSolBalance).toHaveBeenCalledWith(validWalletAddress);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/wallet/balance')
        .expect(401);
    });
  });

  describe('GET /api/wallet/token-balance/:tokenAddress', () => {
    it('should return token balance for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/wallet/token-balance/${validTokenAddress}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('balance', 1000);
      expect(response.body).toHaveProperty('tokenAddress', validTokenAddress);
      expect(response.body).toHaveProperty('walletAddress', validWalletAddress);
      expect(solanaUtils.getTokenBalance).toHaveBeenCalledWith(validWalletAddress, validTokenAddress);
    });

    it('should return 400 if token address is invalid', async () => {
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValueOnce(false);
      
      await request(app)
        .get('/api/wallet/token-balance/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/wallet/validate-address', () => {
    it('should validate a Solana address', async () => {
      const response = await request(app)
        .post('/api/wallet/validate-address')
        .send({ address: validWalletAddress })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('isValid', true);
      expect(response.body).toHaveProperty('address', validWalletAddress);
      expect(solanaUtils.validateSolanaAddress).toHaveBeenCalledWith(validWalletAddress);
    });

    it('should return invalid for bad addresses', async () => {
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValueOnce(false);
      
      const response = await request(app)
        .post('/api/wallet/validate-address')
        .send({ address: 'bad-address' })
        .expect(200);

      expect(response.body).toHaveProperty('isValid', false);
    });
  });

  describe('POST /api/wallet/create-token', () => {
    it('should create a new SPL token', async () => {
      const tokenData = {
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 6,
        initialSupply: 1000000
      };

      const response = await request(app)
        .post('/api/wallet/create-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tokenData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('tokenAddress', 'NewTokenAddress123456789012345678901234');
      expect(response.body).toHaveProperty('txSignature', 'txSignature12345');
      expect(response.body).toHaveProperty('name', tokenData.name);
      expect(response.body).toHaveProperty('symbol', tokenData.symbol);
      
      // Check token was saved to database
      const savedToken = await TokenModel.findOne({ name: tokenData.name });
      expect(savedToken).not.toBeNull();
      expect(savedToken?.decimals).toBe(tokenData.decimals);
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app)
        .post('/api/wallet/create-token')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Incomplete Token' }) // Missing symbol
        .expect(400);
    });
  });

  describe('GET /api/wallet/token-info/:tokenAddress', () => {
    it('should return token information', async () => {
      // Create a token in the database first
      await TokenModel.create({
        name: 'DB Token',
        symbol: 'DBT',
        tokenAddress: validTokenAddress,
        creator: userId,
        creatorWallet: validWalletAddress,
        description: 'Database token for testing',
        totalSupply: 1000000,
        decimals: 9,
        launchDate: new Date(),
        metadata: {
          name: 'DB Token',
          symbol: 'DBT',
          description: 'Database token for testing'
        }
      });

      const response = await request(app)
        .get(`/api/wallet/token-info/${validTokenAddress}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.tokenInfo).toHaveProperty('name', 'DB Token');
      expect(response.body.tokenInfo).toHaveProperty('symbol', 'DBT');
      expect(response.body.tokenInfo).toHaveProperty('decimals', 9);
      expect(response.body.tokenInfo).toHaveProperty('supply', '1000000');
      expect(solanaUtils.getTokenInfo).toHaveBeenCalledWith(validTokenAddress);
    });

    it('should return 400 if token address is invalid', async () => {
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValueOnce(false);
      
      await request(app)
        .get('/api/wallet/token-info/invalid')
        .expect(400);
    });
  });
}); 