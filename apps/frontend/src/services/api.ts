import axios, { AxiosError, AxiosResponse } from 'axios';
import { CreateTokenInputs, TokenDetails, TokenTransferInputs, TransactionRecord } from '../types/token';
import { ROUTES } from '../constants/tooltips';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Error types
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown',
  TIMEOUT = 'timeout',
  FORBIDDEN = 'forbidden'
}

// Error structure with additional information
export interface ApiError extends Error {
  type: ErrorType;
  statusCode?: number;
  isApiError: boolean;
  validationErrors?: Record<string, string[]>;
  originalError?: Error | AxiosError;
}

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create API error helper
const createApiError = (
  message: string, 
  type: ErrorType, 
  statusCode?: number, 
  validationErrors?: Record<string, string[]>,
  originalError?: Error | AxiosError
): ApiError => {
  const error = new Error(message) as ApiError;
  error.type = type;
  error.statusCode = statusCode;
  error.isApiError = true;
  error.validationErrors = validationErrors;
  error.originalError = originalError;
  return error;
};

// Response interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Handle successful responses
    return response;
  },
  (error: AxiosError): Promise<never> => {
    let apiError: ApiError;
    
    if (error.response) {
      // Server returned an error response
      const statusCode = error.response.status;
      const data = error.response.data as any;
      const message = data?.message || 'An error occurred';
      
      switch (statusCode) {
        case 401:
          // Unauthorized, token might be expired
          apiError = createApiError(
            'Authentication required. Please log in again.', 
            ErrorType.AUTHENTICATION, 
            statusCode, 
            undefined, 
            error
          );
          
          // Handle logout and redirect
          if (typeof window !== 'undefined') {
            authService.logout();
            window.location.href = `${ROUTES.LOGIN}?redirect=${window.location.pathname}`;
          }
          break;
          
        case 403:
          // Forbidden
          apiError = createApiError(
            'You do not have permission to access this resource.', 
            ErrorType.FORBIDDEN, 
            statusCode, 
            undefined, 
            error
          );
          break;
          
        case 422:
          // Validation errors
          apiError = createApiError(
            'Validation failed. Please check your input.', 
            ErrorType.VALIDATION, 
            statusCode, 
            data?.errors, 
            error
          );
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          apiError = createApiError(
            'Server error. Please try again later.', 
            ErrorType.SERVER, 
            statusCode, 
            undefined, 
            error
          );
          break;
          
        default:
          // Other errors
          apiError = createApiError(
            message, 
            ErrorType.UNKNOWN, 
            statusCode, 
            undefined, 
            error
          );
      }
    } else if (error.request) {
      // Request was sent but no response received
      apiError = createApiError(
        'Network error. Please check your connection.', 
        ErrorType.NETWORK, 
        undefined, 
        undefined, 
        error
      );
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      apiError = createApiError(
        'Request timed out. Please try again.', 
        ErrorType.TIMEOUT, 
        undefined, 
        undefined, 
        error
      );
    } else {
      // Error occurred while setting up the request
      apiError = createApiError(
        error.message || 'An unexpected error occurred.', 
        ErrorType.UNKNOWN, 
        undefined, 
        undefined, 
        error
      );
    }
    
    // Log error for debugging in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', {
        type: apiError.type,
        message: apiError.message,
        statusCode: apiError.statusCode,
        validationErrors: apiError.validationErrors,
        originalError: error
      });
    }
    
    return Promise.reject(apiError);
  }
);

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const tokenService = {
  async createToken(tokenData: CreateTokenInputs): Promise<{ success: boolean; token?: TokenDetails; message?: string }> {
    try {
      // Check authentication
      if (!authService.isAuthenticated()) {
        return { success: false, message: 'Unauthorized' };
      }

      // Prepare social media data
      const social: Record<string, string> = {};
      if (tokenData.twitter) social.twitter = tokenData.twitter;
      if (tokenData.telegram) social.telegram = tokenData.telegram;
      if (tokenData.discord) social.discord = tokenData.discord;
      if (tokenData.github) social.github = tokenData.github;
      
      // Prepare API data
      const apiData = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        totalSupply: tokenData.totalSupply,
        description: tokenData.description || '',
        website: tokenData.website || '',
        social: Object.keys(social).length > 0 ? social : undefined
      };
      
      const response = await apiClient.post('/wallet/create-token', apiData);
      
      if (response.data.success) {
        return { success: true, token: response.data.token };
      } else {
        return { success: false, message: response.data.message || 'Failed to create token' };
      }
    } catch (error: any) {
      console.error('Token creation error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error creating token' 
      };
    }
  },

  async getTokenDetails(address: string): Promise<{ success: boolean; token?: TokenDetails; message?: string }> {
    try {
      const response = await apiClient.get(`/tokens/${address}`);
      
      if (response.data.success) {
        return { success: true, token: response.data.token };
      } else {
        return { success: false, message: response.data.message || 'Failed to fetch token details' };
      }
    } catch (error: any) {
      console.error('Error fetching token details:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error fetching token details' 
      };
    }
  },
  
  async transferToken(tokenAddress: string, transferData: TokenTransferInputs): Promise<{ success: boolean; transaction?: any; message?: string }> {
    try {
      // Check authentication
      if (!authService.isAuthenticated()) {
        return { success: false, message: 'Unauthorized' };
      }
      
      const response = await apiClient.post(`/wallet/transfer/${tokenAddress}`, transferData);
      
      if (response.data.success) {
        return { success: true, transaction: response.data.transaction };
      } else {
        return { success: false, message: response.data.message || 'Failed to transfer token' };
      }
    } catch (error: any) {
      console.error('Error transferring token:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error transferring token' 
      };
    }
  },
  
  async getTransactions(filters?: { type?: string; token?: string }): Promise<{ success: boolean; transactions?: TransactionRecord[]; message?: string }> {
    try {
      // Check authentication
      if (!authService.isAuthenticated()) {
        return { success: false, message: 'Unauthorized' };
      }
      
      const response = await apiClient.get('/transactions', { params: filters });
      
      if (response.data.success) {
        return { success: true, transactions: response.data.transactions };
      } else {
        return { success: false, message: response.data.message || 'Failed to fetch transactions' };
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error fetching transactions' 
      };
    }
  },
  
  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }
};

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: any; token?: string; message?: string }> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        if (response.data.user.username) {
          localStorage.setItem('username', response.data.user.username);
        }
        return { success: true, user: response.data.user, token: response.data.token };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error during login' 
      };
    }
  },
  
  async register(userData: { username: string; email: string; password: string }): Promise<{ success: boolean; user?: any; token?: string; message?: string }> {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        if (response.data.user.username) {
          localStorage.setItem('username', response.data.user.username);
        }
        return { success: true, user: response.data.user, token: response.data.token };
      } else {
        return { success: false, message: response.data.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error during registration' 
      };
    }
  },
  
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
    }
  },
  
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  }
}; 