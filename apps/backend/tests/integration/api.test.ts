import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { TokenModel } from '../../src/models/token.model';

// Global test variables
let mongoServer: MongoMemoryServer;
let authToken: string;
let userId: string;

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
  await UserModel.deleteMany({});
  await TokenModel.deleteMany({});
});

describe('API Integration Tests', () => {
  describe('Authentication Flow', () => {
    it('should allow user registration and login', async () => {
      // Register a new user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('success', true);
      expect(registerResponse.body).toHaveProperty('token');
      userId = registerResponse.body.user.id;

      // Login with created user
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('success', true);
      expect(loginResponse.body).toHaveProperty('token');
      authToken = loginResponse.body.token;
    });
  });

  describe('Token Management', () => {
    beforeEach(async () => {
      // Register a user and get auth token
      const userData = {
        email: 'token@example.com',
        password: 'password123',
        username: 'tokenuser',
        walletAddress: 'TokenUserWallet123'
      };

      // Create user directly
      const user = await UserModel.create(userData);
      userId = user._id.toString();

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      authToken = loginResponse.body.token;
    });

    it('should create and retrieve a token', async () => {
      // Create a token
      const tokenData = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token for integration testing',
        category: 'Utility',
        tokenAddress: 'TestTokenAddress123',
        supply: 1000000,
        decimals: 9,
        logo: 'https://example.com/logo.png',
        website: 'https://example.com'
      };

      const createResponse = await request(app)
        .post('/api/tokens')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tokenData)
        .expect(201);

      expect(createResponse.body).toHaveProperty('message', 'Token created successfully');
      expect(createResponse.body.token).toHaveProperty('name', tokenData.name);
      expect(createResponse.body.token).toHaveProperty('symbol', tokenData.symbol);

      const tokenId = createResponse.body.token._id;

      // Get token details
      const getResponse = await request(app)
        .get(`/api/tokens/${tokenId}`)
        .expect(200);

      expect(getResponse.body.token).toHaveProperty('name', tokenData.name);
      expect(getResponse.body.token).toHaveProperty('creator', userId);
    });

    it('should get all user tokens', async () => {
      // Create multiple tokens for user
      const tokenData1 = {
        name: 'First Token',
        symbol: 'FIRST',
        description: 'First test token',
        tokenAddress: 'FirstTokenAddress',
        creator: userId,
        creatorWallet: 'TokenUserWallet123'
      };

      const tokenData2 = {
        name: 'Second Token',
        symbol: 'SECOND',
        description: 'Second test token',
        tokenAddress: 'SecondTokenAddress',
        creator: userId,
        creatorWallet: 'TokenUserWallet123'
      };

      await TokenModel.create(tokenData1);
      await TokenModel.create(tokenData2);

      // Update user's tokens array
      await UserModel.findByIdAndUpdate(userId, {
        $push: { 
          tokens: [tokenData1.tokenAddress, tokenData2.tokenAddress]
        }
      });

      // Get user's tokens
      const response = await request(app)
        .get('/api/tokens/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens.length).toBe(2);
      expect(response.body.tokens[0].symbol).toBe('FIRST');
      expect(response.body.tokens[1].symbol).toBe('SECOND');
    });
  });
}); 