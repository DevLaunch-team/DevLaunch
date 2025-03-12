import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as tokenController from '../../../src/controllers/tokenController';
import { TokenModel } from '../../../src/models/token.model';
import UserModel from '../../../src/models/user.model';
import { TokenStatus } from '../../../src/types/token.types';

// Mock Request and Response
const mockRequest = () => {
  const req: Partial<Request> = {};
  req.body = {};
  req.params = {};
  req.query = {};
  req.user = {
    id: 'testUserId',
    walletAddress: 'testWalletAddress'
  };
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

// Setup in-memory MongoDB server
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database between tests
  await TokenModel.deleteMany({});
  await UserModel.deleteMany({});
});

describe('Token Controller', () => {
  describe('getTokens', () => {
    it('should get all tokens with pagination', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.query = { page: '1', limit: '10' };
      
      // Create some test tokens
      await TokenModel.create({
        name: 'Test Token 1',
        symbol: 'TT1',
        tokenAddress: 'address1',
        creator: 'testUserId',
        creatorWallet: 'testWalletAddress',
        status: TokenStatus.PENDING
      });
      
      await TokenModel.create({
        name: 'Test Token 2',
        symbol: 'TT2',
        tokenAddress: 'address2',
        creator: 'testUserId',
        creatorWallet: 'testWalletAddress',
        status: TokenStatus.DEPLOYED
      });
      
      // Act
      await tokenController.getTokens(req, res);
      
      // Assert
      expect(res.json).toHaveBeenCalled();
      const jsonResponse = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonResponse.tokens.length).toBe(2);
      expect(jsonResponse.pagination.total).toBe(2);
      expect(jsonResponse.pagination.page).toBe(1);
    });

    it('should filter tokens by status', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.query = { status: TokenStatus.DEPLOYED };
      
      // Create some test tokens
      await TokenModel.create({
        name: 'Test Token 1',
        symbol: 'TT1',
        tokenAddress: 'address1',
        creator: 'testUserId',
        creatorWallet: 'testWalletAddress',
        status: TokenStatus.PENDING
      });
      
      await TokenModel.create({
        name: 'Test Token 2',
        symbol: 'TT2',
        tokenAddress: 'address2',
        creator: 'testUserId',
        creatorWallet: 'testWalletAddress',
        status: TokenStatus.DEPLOYED
      });
      
      // Act
      await tokenController.getTokens(req, res);
      
      // Assert
      expect(res.json).toHaveBeenCalled();
      const jsonResponse = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonResponse.tokens.length).toBe(1);
      expect(jsonResponse.tokens[0].status).toBe(TokenStatus.DEPLOYED);
    });
  });

  describe('createToken', () => {
    it('should create a new token successfully', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      // Create test user
      const user = await UserModel.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        walletAddress: 'testWalletAddress'
      });
      
      req.user = { id: user._id.toString(), walletAddress: 'testWalletAddress' };
      req.body = {
        name: 'New Token',
        symbol: 'NEWT',
        description: 'A new test token',
        category: 'Utility',
        tokenAddress: 'newTokenAddress',
        supply: 1000000,
        decimals: 9,
        logo: 'https://example.com/logo.png',
        website: 'https://example.com'
      };
      
      // Act
      await tokenController.createToken(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      
      // Check database
      const token = await TokenModel.findOne({ tokenAddress: 'newTokenAddress' });
      expect(token).not.toBeNull();
      expect(token!.name).toBe('New Token');
      expect(token!.creator.toString()).toBe(user._id.toString());
      
      // Check user's tokens array
      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser!.tokens).toContain(token!._id);
    });

    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.user = undefined; // No user
      
      // Act
      await tokenController.createToken(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
  });
}); 