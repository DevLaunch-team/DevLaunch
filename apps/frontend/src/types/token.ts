export interface TokenDetails {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  description?: string;
  website?: string;
  tokenAddress: string;
  creator?: {
    username: string;
    walletAddress: string;
  };
  createdAt: string;
  holders: number;
  social?: {
    twitter?: string;
    telegram?: string;
    github?: string;
  };
}

export interface CreateTokenInputs {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  github?: string;
}

export interface TokenTransferInputs {
  recipient: string;
  amount: number;
  memo?: string;
}

export interface TransactionRecord {
  id: string;
  type: 'sent' | 'received' | 'created';
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  sender: string;
  recipient: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  signature: string;
} 