import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Get network from environment or default to devnet
export const getNetworkConfiguration = (): WalletAdapterNetwork => {
  const networkParam = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork || WalletAdapterNetwork.Devnet;
  return networkParam;
};

// Get RPC endpoint from environment or use cluster API
export const getRpcEndpoint = (): string => {
  const networkParam = getNetworkConfiguration();
  return process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(networkParam);
};

// Get supported wallet adapters
export const getSupportedWallets = () => {
  const networkParam = getNetworkConfiguration();
  return [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: networkParam }),
  ];
}; 