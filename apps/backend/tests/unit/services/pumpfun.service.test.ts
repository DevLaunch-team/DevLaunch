import axios from 'axios';
import pumpfunService from '../../../src/services/pumpfun.service';
import logger from '../../../src/utils/logger';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/config', () => ({
  pumpfun: {
    apiBaseUrl: 'https://api.test.com',
    apiKey: 'test-api-key'
  }
}));

describe('PumpFun Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTradingPair', () => {
    it('should create a trading pair successfully', async () => {
      // Arrange
      const mockResponse = {
        data: {
          pair_id: 'test-pair-id'
        }
      };
      (axios.create as jest.Mock).mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: jest.fn()
          }
        }
      });

      // Act
      const result = await pumpfunService.createTradingPair(
        'TokenAddress123',
        0.001,
        1.0,
        'CreatorWallet123'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.pairId).toBe('test-pair-id');
    });

    it('should handle errors when creating a trading pair', async () => {
      // Arrange
      const errorMessage = 'API Error';
      (axios.create as jest.Mock).mockReturnValue({
        post: jest.fn().mockRejectedValue(new Error(errorMessage)),
        interceptors: {
          response: {
            use: jest.fn()
          }
        }
      });

      // Act
      const result = await pumpfunService.createTradingPair(
        'TokenAddress123',
        0.001,
        1.0,
        'CreatorWallet123'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should validate token address', async () => {
      // Act
      const result = await pumpfunService.createTradingPair(
        'invalid-address', // Invalid Solana address format
        0.001,
        1.0,
        'CreatorWallet123'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Solana token address');
    });
  });

  describe('getTokenPrice', () => {
    it('should get token price successfully', async () => {
      // Arrange
      const mockResponse = {
        data: {
          price: 0.001,
          price_change_24h: 5.2,
          liquidity: 10000,
          volume_24h: 5000,
          market_cap: 100000
        }
      };
      (axios.create as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: {
            use: jest.fn()
          }
        }
      });

      // Act
      const result = await pumpfunService.getTokenPrice('TokenAddress123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.price).toBe(0.001);
      expect(result.priceChange24h).toBe(5.2);
    });

    it('should handle errors when getting token price', async () => {
      // Arrange
      const errorMessage = 'API Error';
      (axios.create as jest.Mock).mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error(errorMessage)),
        interceptors: {
          response: {
            use: jest.fn()
          }
        }
      });

      // Act
      const result = await pumpfunService.getTokenPrice('TokenAddress123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 