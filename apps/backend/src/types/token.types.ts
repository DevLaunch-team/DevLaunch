import { Document, Types } from 'mongoose';

export enum TokenStatus {
  PENDING = 'pending',
  DEPLOYED = 'deployed',
  TRADING = 'trading',
  DELISTED = 'delisted'
}

export interface TokenData {
  name: string;
  symbol: string;
  description?: string;
  category?: string;
  tokenAddress: string;
  creator: Types.ObjectId | string;
  creatorWallet: string;
  supply?: number;
  decimals?: number;
  logo?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  status: TokenStatus;
  tradingInfo?: {
    pumpfunPairId?: string;
    tradingUrl?: string;
    initialPrice?: number;
    createdAt?: Date;
  };
  marketData?: {
    price?: number;
    priceChange24h?: number;
    volume24h?: number;
    marketCap?: number;
    holders?: number;
  };
  metadata?: Record<string, any>;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TokenDocument extends TokenData, Document {
  _id: Types.ObjectId;
}

export interface CreateTokenDto {
  name: string;
  symbol: string;
  description?: string;
  category?: string;
  tokenAddress: string;
  supply?: number;
  decimals?: number;
  logo?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
}

export interface UpdateTokenDto {
  name?: string;
  symbol?: string;
  description?: string;
  category?: string;
  supply?: number;
  decimals?: number;
  logo?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  status?: TokenStatus;
}

export interface TokenSearchQuery {
  query?: string;
  category?: string;
  creator?: string;
  status?: TokenStatus;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
} 