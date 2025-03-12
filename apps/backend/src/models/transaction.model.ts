import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transactionType: string;  // 'token-creation', 'sol-transfer', 'token-transfer', etc.
  sender: mongoose.Types.ObjectId | string;
  senderWallet: string;
  recipient?: string;
  amount?: number;
  tokenAddress?: string;
  tokenSymbol?: string;
  txSignature: string;
  status: string;  // 'pending', 'confirmed', 'failed'
  createdAt: Date;
  updatedAt: Date;
  network: string;  // 'mainnet', 'devnet', 'testnet'
  blockTime?: number;
  fee?: number;
  errorMessage?: string;
}

const TransactionSchema: Schema = new Schema(
  {
    transactionType: {
      type: String,
      required: true,
      enum: ['token-creation', 'sol-transfer', 'token-transfer', 'nft-transfer', 'token-mint']
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderWallet: {
      type: String,
      required: true
    },
    recipient: {
      type: String
    },
    amount: {
      type: Number
    },
    tokenAddress: {
      type: String
    },
    tokenSymbol: {
      type: String
    },
    txSignature: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending'
    },
    network: {
      type: String,
      required: true,
      enum: ['mainnet-beta', 'devnet', 'testnet'],
      default: 'devnet'
    },
    blockTime: {
      type: Number
    },
    fee: {
      type: Number
    },
    errorMessage: {
      type: String
    }
  },
  { timestamps: true }
);

// Index for faster queries
TransactionSchema.index({ sender: 1, createdAt: -1 });
TransactionSchema.index({ txSignature: 1 }, { unique: true });
TransactionSchema.index({ senderWallet: 1 });
TransactionSchema.index({ tokenAddress: 1 });

const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction; 