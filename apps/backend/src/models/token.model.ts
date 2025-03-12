import mongoose, { Document, Schema } from 'mongoose';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  externalUrl?: string;
  projectWebsite?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    github?: string;
  };
  developerInfo?: {
    githubUsername?: string;
    verificationScore?: number;
    projectHistory?: string[];
  };
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface TradingInfo {
  pumpfunPairId: string;
  tradingUrl: string;
  initialPrice: string;
  createdAt: Date;
  liquidityAmount?: string;
}

export interface IToken extends Document {
  name: string;
  symbol: string;
  tokenAddress: string;
  creator: mongoose.Types.ObjectId;
  creatorWallet: string;
  description?: string;
  totalSupply: number;
  decimals: number;
  status: 'pending' | 'deployed' | 'trading' | 'delisted';
  launchDate: Date;
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  logo?: string;
  metadata: {
    name: string;
    symbol: string;
    description?: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TokenSchema = new Schema<IToken>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  tokenAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  creatorWallet: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  totalSupply: {
    type: Number,
    required: true,
    default: 0
  },
  decimals: {
    type: Number,
    required: true,
    default: 9
  },
  status: {
    type: String,
    enum: ['pending', 'deployed', 'trading', 'delisted'],
    default: 'deployed',
    index: true
  },
  launchDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  website: {
    type: String
  },
  twitter: {
    type: String
  },
  discord: {
    type: String
  },
  telegram: {
    type: String
  },
  logo: {
    type: String
  },
  metadata: {
    name: {
      type: String,
      required: true
    },
    symbol: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    image: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for common queries
TokenSchema.index({ name: 'text', symbol: 'text', description: 'text' });

const TokenModel = mongoose.model<IToken>('Token', TokenSchema);

export default TokenModel; 