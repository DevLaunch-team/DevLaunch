import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import axios from 'axios';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  address: string;
}

const WalletDashboard: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [addressToValidate, setAddressToValidate] = useState('');
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Fetch SOL Balance
  const fetchSOLBalance = async () => {
    if (!connected) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSolBalance(response.data.balance);
      } else {
        setError(response.data.message || 'Failed to fetch SOL balance');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching SOL balance');
      console.error('Error fetching SOL balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Token Balance
  const fetchTokenBalance = async () => {
    if (!connected || !tokenAddress.trim()) return;
    
    setIsLoading(true);
    setError('');
    setTokenBalance(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/wallet/token-balance/${tokenAddress}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setTokenBalance(response.data.balance);
      } else {
        setError(response.data.message || 'Failed to fetch token balance');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching token balance');
      console.error('Error fetching token balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate Solana Address
  const validateAddress = async () => {
    if (!addressToValidate.trim()) return;
    
    setIsLoading(true);
    setError('');
    setIsValidAddress(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/wallet/validate-address`, {
        address: addressToValidate
      });
      
      if (response.data.success) {
        setIsValidAddress(response.data.isValid);
      } else {
        setError(response.data.message || 'Address validation failed');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error validating address');
      console.error('Error validating address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get Token Info
  const getTokenInfo = async () => {
    if (!tokenAddress.trim()) return;
    
    setIsLoading(true);
    setError('');
    setTokenInfo(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/wallet/token-info/${tokenAddress}`);
      
      if (response.data.success) {
        setTokenInfo(response.data.tokenInfo);
      } else {
        setError(response.data.message || 'Failed to fetch token information');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching token information');
      console.error('Error fetching token info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch SOL balance on component mount if connected
  useEffect(() => {
    if (connected) {
      fetchSOLBalance();
    }
  }, [connected]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Wallet Dashboard</h1>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Connect Your Wallet</h2>
          <WalletMultiButton className="bg-indigo-600 hover:bg-indigo-700" />
        </div>
        
        {connected ? (
          <p className="text-green-600">
            Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </p>
        ) : (
          <p className="text-amber-600">Please connect your wallet to use all features</p>
        )}
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOL Balance Section */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-800">SOL Balance</h3>
          {solBalance !== null ? (
            <p className="text-2xl font-bold text-indigo-600">{solBalance} SOL</p>
          ) : (
            <p className="text-gray-500">Connect wallet to view balance</p>
          )}
          <button
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
            onClick={fetchSOLBalance}
            disabled={!connected || isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Balance'}
          </button>
        </div>
        
        {/* Token Balance Section */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Token Balance</h3>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter token address"
              className="w-full p-2 border border-gray-300 rounded"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </div>
          
          {tokenBalance !== null && (
            <p className="text-2xl font-bold text-indigo-600">
              {tokenBalance} {tokenInfo?.symbol || 'tokens'}
            </p>
          )}
          
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
            onClick={fetchTokenBalance}
            disabled={!connected || !tokenAddress || isLoading}
          >
            {isLoading ? 'Loading...' : 'Check Token Balance'}
          </button>
        </div>
        
        {/* Validate Address Section */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Validate Solana Address</h3>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter Solana address to validate"
              className="w-full p-2 border border-gray-300 rounded"
              value={addressToValidate}
              onChange={(e) => setAddressToValidate(e.target.value)}
            />
          </div>
          
          {isValidAddress !== null && (
            <p className={`font-semibold ${isValidAddress ? 'text-green-600' : 'text-red-600'}`}>
              Address is {isValidAddress ? 'valid' : 'invalid'}
            </p>
          )}
          
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
            onClick={validateAddress}
            disabled={!addressToValidate || isLoading}
          >
            {isLoading ? 'Validating...' : 'Validate Address'}
          </button>
        </div>
        
        {/* Token Info Section */}
        <div className="bg-gray-50 p-5 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Token Information</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Use the same token address as above or enter a new one
            </p>
          </div>
          
          <button
            className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
            onClick={getTokenInfo}
            disabled={!tokenAddress || isLoading}
          >
            {isLoading ? 'Loading...' : 'Get Token Info'}
          </button>
          
          {tokenInfo && (
            <div className="mt-4 p-4 bg-white rounded border border-gray-200">
              <h4 className="font-bold text-lg">{tokenInfo.name} ({tokenInfo.symbol})</h4>
              <p className="text-sm text-gray-600 mt-2">Address: {tokenInfo.address}</p>
              <p className="text-sm text-gray-600">Decimals: {tokenInfo.decimals}</p>
              <p className="text-sm text-gray-600">Supply: {tokenInfo.supply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard; 