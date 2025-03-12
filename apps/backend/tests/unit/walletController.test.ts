import { Request, Response } from 'express';
import * as walletController from '../../src/controllers/walletController';
import User from '../../src/models/User';
import TokenModel from '../../src/models/token.model';
import Transaction from '../../src/models/transaction.model';
import * as solanaUtils from '../../src/utils/solana';

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('../../src/models/token.model');
jest.mock('../../src/models/transaction.model');
jest.mock('../../src/utils/solana');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('Wallet Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any = {};

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request and response
    mockRequest = {
      user: { id: 'user123' },
      params: {},
      query: {},
      body: {},
    };
    
    responseObject = {
      statusCode: 200,
      json: jest.fn().mockReturnThis(),
    };
    
    mockResponse = {
      status: jest.fn().mockImplementation((code) => {
        responseObject.statusCode = code;
        return responseObject;
      }),
      json: responseObject.json,
    };
  });

  describe('getWalletBalance', () => {
    it('should return wallet balance for authenticated user', async () => {
      // Mock User.findById
      (User.findById as jest.Mock).mockResolvedValue({
        walletAddress: 'wallet123',
      });
      
      // Mock validateSolanaAddress
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValue(true);
      
      // Mock getSolBalance
      (solanaUtils.getSolBalance as jest.Mock).mockResolvedValue(5.5);
      
      await walletController.getWalletBalance(mockRequest as any, mockResponse as any);
      
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(solanaUtils.validateSolanaAddress).toHaveBeenCalledWith('wallet123');
      expect(solanaUtils.getSolBalance).toHaveBeenCalledWith('wallet123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        balance: 5.5,
        walletAddress: 'wallet123',
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      
      await walletController.getWalletBalance(mockRequest as any, mockResponse as any);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not authenticated',
      });
    });

    it('should return 404 if user is not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      
      await walletController.getWalletBalance(mockRequest as any, mockResponse as any);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 400 if user does not have a valid wallet address', async () => {
      (User.findById as jest.Mock).mockResolvedValue({
        walletAddress: 'invalid',
      });
      
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValue(false);
      
      await walletController.getWalletBalance(mockRequest as any, mockResponse as any);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User does not have a valid wallet address',
      });
    });
  });

  describe('getTokenBalance', () => {
    it('should return token balance for authenticated user', async () => {
      mockRequest.params = { tokenAddress: 'token123' };
      
      // Mock User.findById
      (User.findById as jest.Mock).mockResolvedValue({
        walletAddress: 'wallet123',
      });
      
      // Mock validateSolanaAddress
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValue(true);
      
      // Mock getTokenBalance
      (solanaUtils.getTokenBalance as jest.Mock).mockResolvedValue(1000);
      
      await walletController.getTokenBalance(mockRequest as any, mockResponse as any);
      
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(solanaUtils.validateSolanaAddress).toHaveBeenCalledWith('token123');
      expect(solanaUtils.validateSolanaAddress).toHaveBeenCalledWith('wallet123');
      expect(solanaUtils.getTokenBalance).toHaveBeenCalledWith('wallet123', 'token123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        balance: 1000,
        tokenAddress: 'token123',
        walletAddress: 'wallet123',
      });
    });
  });

  describe('validateAddress', () => {
    it('should validate a Solana address', async () => {
      mockRequest.body = { address: 'valid123' };
      
      // Mock validateSolanaAddress
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValue(true);
      
      await walletController.validateAddress(mockRequest as any, mockResponse as any);
      
      expect(solanaUtils.validateSolanaAddress).toHaveBeenCalledWith('valid123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        isValid: true,
        address: 'valid123',
      });
    });

    it('should return invalid for bad addresses', async () => {
      mockRequest.body = { address: 'invalid' };
      
      // Mock validateSolanaAddress
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValue(false);
      
      await walletController.validateAddress(mockRequest as any, mockResponse as any);
      
      expect(solanaUtils.validateSolanaAddress).toHaveBeenCalledWith('invalid');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        isValid: false,
        address: 'invalid',
      });
    });
  });

  describe('createToken', () => {
    it('should create a new SPL token', async () => {
      mockRequest.body = {
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 6,
        initialSupply: 1000000,
      };
      
      // Mock User.findById
      (User.findById as jest.Mock).mockResolvedValue({
        _id: 'user123',
        walletAddress: 'wallet123',
        username: 'testuser',
      });
      
      // Mock validateSolanaAddress
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValue(true);
      
      // Mock getAdminKeypair
      const mockKeypair = {
        publicKey: {
          toBase58: () => 'admin123',
        },
      };
      (solanaUtils.getAdminKeypair as jest.Mock).mockReturnValue(mockKeypair);
      
      // Mock createToken
      (solanaUtils.createToken as jest.Mock).mockResolvedValue({
        tokenAddress: 'newtoken123',
        txSignature: 'tx123',
      });
      
      // Mock TokenModel.prototype.save
      const saveMock = jest.fn().mockResolvedValue(true);
      (TokenModel as any).mockImplementation(() => ({
        save: saveMock,
      }));
      
      await walletController.createToken(mockRequest as any, mockResponse as any);
      
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(solanaUtils.validateSolanaAddress).toHaveBeenCalledWith('wallet123');
      expect(solanaUtils.getAdminKeypair).toHaveBeenCalled();
      expect(solanaUtils.createToken).toHaveBeenCalledWith(
        mockKeypair,
        6,
        1000000
      );
      expect(TokenModel).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Token',
        symbol: 'TEST',
        tokenAddress: 'newtoken123',
        creator: 'user123',
        creatorWallet: 'wallet123',
        decimals: 6,
        totalSupply: 1000000,
      }));
      expect(saveMock).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        tokenAddress: 'newtoken123',
        txSignature: 'tx123',
        name: 'Test Token',
        symbol: 'TEST',
      });
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history for authenticated user', async () => {
      mockRequest.query = { page: '1', limit: '10' };
      
      // Mock Transaction.find
      const mockFind = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([
        { id: 'tx1', transactionType: 'sol-transfer' },
        { id: 'tx2', transactionType: 'token-transfer' },
      ]);
      
      Transaction.find = mockFind;
      Transaction.countDocuments = jest.fn().mockResolvedValue(2);
      
      mockFind.mockReturnValue({
        sort: mockSort,
        skip: mockSkip,
        limit: mockLimit,
      });
      
      await walletController.getTransactionHistory(mockRequest as any, mockResponse as any);
      
      expect(Transaction.find).toHaveBeenCalledWith({ sender: 'user123' });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(Transaction.countDocuments).toHaveBeenCalledWith({ sender: 'user123' });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        transactions: [
          { id: 'tx1', transactionType: 'sol-transfer' },
          { id: 'tx2', transactionType: 'token-transfer' },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });
    });
  });

  describe('transferSolToWallet', () => {
    it('should transfer SOL to another wallet', async () => {
      mockRequest.body = {
        recipientAddress: 'recipient123',
        amount: 1.5,
      };
      
      // Mock User.findById
      (User.findById as jest.Mock).mockResolvedValue({
        _id: 'user123',
        walletAddress: 'wallet123',
      });
      
      // Mock validateSolanaAddress
      (solanaUtils.validateSolanaAddress as jest.Mock).mockReturnValue(true);
      
      // Mock getAdminKeypair
      const mockKeypair = {
        publicKey: {
          toBase58: () => 'admin123',
        },
      };
      (solanaUtils.getAdminKeypair as jest.Mock).mockReturnValue(mockKeypair);
      
      // Mock transferSol
      (solanaUtils.transferSol as jest.Mock).mockResolvedValue('tx123');
      
      // Mock Transaction.prototype.save
      const saveMock = jest.fn().mockResolvedValue(true);
      (Transaction as any).mockImplementation(() => ({
        save: saveMock,
      }));
      
      await walletController.transferSolToWallet(mockRequest as any, mockResponse as any);
      
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(solanaUtils.validateSolanaAddress).toHaveBeenCalledWith('recipient123');
      expect(solanaUtils.getAdminKeypair).toHaveBeenCalled();
      expect(solanaUtils.transferSol).toHaveBeenCalledWith('recipient123', 1.5);
      expect(Transaction).toHaveBeenCalledWith(expect.objectContaining({
        transactionType: 'sol-transfer',
        sender: 'user123',
        senderWallet: 'admin123',
        recipient: 'recipient123',
        amount: 1.5,
        txSignature: 'tx123',
        status: 'confirmed',
      }));
      expect(saveMock).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        txSignature: 'tx123',
        amount: 1.5,
        recipientAddress: 'recipient123',
      });
    });
  });
}); 