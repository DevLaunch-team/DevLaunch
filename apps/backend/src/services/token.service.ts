import TokenModel, { IToken } from '../models/token.model';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint, getMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { logger } from '../utils/logger';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * Create a new token in the database
 */
export const createToken = async (tokenData: Partial<IToken>): Promise<IToken> => {
  try {
    const token = new TokenModel(tokenData);
    await token.save();
    return token;
  } catch (error) {
    logger.error('Error creating token in database:', error);
    throw error;
  }
};

/**
 * Get all tokens created by a user
 */
export const getTokensByUser = async (userId: string): Promise<IToken[]> => {
  try {
    return await TokenModel.find({ creator: userId }).sort({ createdAt: -1 });
  } catch (error) {
    logger.error('Error fetching user tokens:', error);
    throw error;
  }
};

/**
 * Get token by address
 */
export const getTokenByAddress = async (tokenAddress: string): Promise<IToken | null> => {
  try {
    return await TokenModel.findOne({ tokenAddress });
  } catch (error) {
    logger.error('Error fetching token by address:', error);
    throw error;
  }
};

/**
 * Get token templates
 */
export const getTokenTemplates = async (): Promise<any[]> => {
  // This could be fetched from a database in the future
  return [
    {
      id: 'standard',
      name: 'Standard Token',
      description: 'Basic SPL token with customizable supply',
      features: ['Mintable', 'Customizable decimals', 'Standard SPL compliance'],
      defaultSettings: {
        decimals: 9,
        freezeAuthority: false
      }
    },
    {
      id: 'governance',
      name: 'Governance Token',
      description: 'Token with governance rights for DAOs',
      features: ['Voting capabilities', 'Proposal creation', 'DAO integration'],
      defaultSettings: {
        decimals: 6,
        freezeAuthority: false
      }
    },
    {
      id: 'utility',
      name: 'Utility Token',
      description: 'Token designed for specific platform utility',
      features: ['Platform-specific use cases', 'Ecosystem integration', 'Service access'],
      defaultSettings: {
        decimals: 9,
        freezeAuthority: true
      }
    },
    {
      id: 'nft',
      name: 'NFT Collection',
      description: 'Create an NFT collection with multiple tokens',
      features: ['Non-fungible', 'Metadata support', 'Collection grouping'],
      defaultSettings: {
        decimals: 0,
        freezeAuthority: false
      }
    }
  ];
};

/**
 * Deploy token to blockchain
 */
export const deployToken = async (tokenAddress: string): Promise<IToken> => {
  try {
    // Get token from database
    const token = await TokenModel.findOne({ tokenAddress });
    
    if (!token) {
      throw new Error('Token not found');
    }
    
    if (token.deployed) {
      throw new Error('Token already deployed');
    }
    
    // In a real implementation, we would generate a keypair securely
    // This is just a placeholder for demonstration
    const payer = Keypair.generate();
    const mintAuthority = Keypair.generate();
    const freezeAuthority = token.freezeAuthority ? mintAuthority.publicKey : null;
    
    // Create the token mint
    const mint = await createMint(
      connection,
      payer,
      mintAuthority.publicKey,
      freezeAuthority,
      token.decimals
    );
    
    // Get the token account associated with the mint
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    
    // Mint initial supply to creator
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      mintAuthority,
      token.initialSupply * Math.pow(10, token.decimals)
    );
    
    // Update token in database
    token.tokenAddress = mint.toBase58();
    token.deployed = true;
    await token.save();
    
    return token;
  } catch (error) {
    logger.error('Error deploying token:', error);
    throw error;
  }
}; 