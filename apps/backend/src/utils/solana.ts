import * as web3 from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import * as bs58 from 'bs58';
import logger from './logger';

// Environment variables
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const ADMIN_WALLET_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY || '';

/**
 * Get Solana connection instance
 */
export const getConnection = (): web3.Connection => {
  return new web3.Connection(SOLANA_RPC_URL, 'confirmed');
};

/**
 * Get admin wallet keypair
 */
export const getAdminKeypair = (): web3.Keypair | null => {
  try {
    if (!ADMIN_WALLET_PRIVATE_KEY) {
      logger.warn('Admin wallet private key not set');
      return null;
    }
    
    const secretKey = bs58.decode(ADMIN_WALLET_PRIVATE_KEY);
    return web3.Keypair.fromSecretKey(secretKey);
  } catch (error) {
    logger.error(`Error getting admin keypair: ${error}`);
    return null;
  }
};

/**
 * Validate a Solana address
 * @param address Solana address to validate
 */
export const validateSolanaAddress = (address: string): boolean => {
  try {
    new web3.PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get SOL balance for an address
 * @param address Solana wallet address
 */
export const getSolBalance = async (address: string): Promise<number> => {
  try {
    if (!validateSolanaAddress(address)) {
      throw new Error('Invalid Solana address');
    }
    
    const connection = getConnection();
    const publicKey = new web3.PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    
    return balance / web3.LAMPORTS_PER_SOL;
  } catch (error) {
    logger.error(`Error getting SOL balance: ${error}`);
    return 0;
  }
};

/**
 * Get SPL token balance for an address
 * @param walletAddress Solana wallet address
 * @param tokenAddress SPL token mint address
 */
export const getTokenBalance = async (walletAddress: string, tokenAddress: string): Promise<number> => {
  try {
    if (!validateSolanaAddress(walletAddress) || !validateSolanaAddress(tokenAddress)) {
      throw new Error('Invalid address');
    }
    
    const connection = getConnection();
    const walletPublicKey = new web3.PublicKey(walletAddress);
    const tokenPublicKey = new web3.PublicKey(tokenAddress);
    
    // Find the associated token account
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: tokenPublicKey }
    );
    
    if (tokenAccounts.value.length === 0) {
      return 0;
    }
    
    // Get the balance
    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance;
  } catch (error) {
    logger.error(`Error getting token balance: ${error}`);
    return 0;
  }
};

/**
 * Transfer SOL from admin wallet to recipient
 * @param recipientAddress Recipient wallet address
 * @param amount Amount of SOL to transfer
 */
export const transferSol = async (recipientAddress: string, amount: number): Promise<string> => {
  try {
    if (!validateSolanaAddress(recipientAddress)) {
      throw new Error('Invalid recipient address');
    }
    
    const adminKeypair = getAdminKeypair();
    if (!adminKeypair) {
      throw new Error('Admin keypair not available');
    }
    
    const connection = getConnection();
    const recipientPublicKey = new web3.PublicKey(recipientAddress);
    
    // Create and sign transaction
    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: adminKeypair.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * web3.LAMPORTS_PER_SOL
      })
    );
    
    // Send transaction
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [adminKeypair]
    );
    
    return signature;
  } catch (error) {
    logger.error(`Error transferring SOL: ${error}`);
    throw error;
  }
};

/**
 * Get token info
 * @param tokenAddress SPL token mint address
 */
export const getTokenInfo = async (tokenAddress: string): Promise<any> => {
  try {
    if (!validateSolanaAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }
    
    const connection = getConnection();
    const tokenPublicKey = new web3.PublicKey(tokenAddress);
    
    // Get token supply
    const supply = await splToken.getMint(
      connection,
      tokenPublicKey
    );
    
    return {
      address: tokenAddress,
      supply: supply.supply,
      decimals: supply.decimals,
    };
  } catch (error) {
    logger.error(`Error getting token info: ${error}`);
    throw error;
  }
};

/**
 * Create SPL token
 * @param owner Owner wallet keypair
 * @param decimals Token decimals (usually 9)
 * @param initialSupply Initial token supply
 */
export const createToken = async (
  owner: web3.Keypair,
  decimals: number = 9,
  initialSupply: number = 1000000000
): Promise<{ tokenAddress: string; txSignature: string }> => {
  try {
    const connection = getConnection();
    
    // Create mint account
    const mintAccount = await splToken.createMint(
      connection,
      owner,
      owner.publicKey,
      owner.publicKey,
      decimals
    );
    
    // Get associated token account
    const associatedTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mintAccount,
      owner.publicKey
    );
    
    // Mint tokens to the associated token account
    const mintToSignature = await splToken.mintTo(
      connection,
      owner,
      mintAccount,
      associatedTokenAccount.address,
      owner,
      initialSupply * Math.pow(10, decimals)
    );
    
    return {
      tokenAddress: mintAccount.toBase58(),
      txSignature: mintToSignature
    };
  } catch (error) {
    logger.error(`Error creating token: ${error}`);
    throw error;
  }
};

/**
 * Transfer SPL token from one wallet to another
 * @param owner Owner wallet keypair
 * @param tokenAddress SPL token mint address
 * @param recipientAddress Recipient wallet address
 * @param amount Amount of tokens to transfer
 * @param decimals Token decimals
 */
export const transferToken = async (
  owner: web3.Keypair,
  tokenAddress: string,
  recipientAddress: string,
  amount: number,
  decimals: number = 9
): Promise<string> => {
  try {
    if (!validateSolanaAddress(tokenAddress) || !validateSolanaAddress(recipientAddress)) {
      throw new Error('Invalid address');
    }
    
    const connection = getConnection();
    const mintPublicKey = new web3.PublicKey(tokenAddress);
    const recipientPublicKey = new web3.PublicKey(recipientAddress);
    
    // Get source token account
    const sourceTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mintPublicKey,
      owner.publicKey
    );
    
    // Get or create destination token account
    const destinationTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mintPublicKey,
      recipientPublicKey
    );
    
    // Transfer tokens
    const transferSignature = await splToken.transfer(
      connection,
      owner,
      sourceTokenAccount.address,
      destinationTokenAccount.address,
      owner,
      amount * Math.pow(10, decimals)
    );
    
    return transferSignature;
  } catch (error) {
    logger.error(`Error transferring token: ${error}`);
    throw error;
  }
}; 