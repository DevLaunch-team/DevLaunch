import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { 
  ArrowLeftIcon, 
  ArrowPathIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
  ClipboardDocumentCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n';
import Navbar from '../components/Navbar';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  tokenAddress: string;
}

type TransferInputs = {
  recipient: string;
  amount: string;
  memo?: string;
};

const TransfersPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [isClipboardCopied, setIsClipboardCopied] = useState<string | null>(null);
  const { t } = useTranslation();
  const router = useRouter();
  const { token: tokenAddress } = router.query;
  const { connected, publicKey } = useWallet();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<TransferInputs>();
  const amount = watch('amount');
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  // Load token information
  const fetchTokenInfo = async () => {
    if (!tokenAddress) return;
    
    setIsLoadingToken(true);
    
    try {
      // Get token details
      const tokenResponse = await axios.get(`${API_BASE_URL}/wallet/token-info/${tokenAddress}`);
      
      if (tokenResponse.data.success) {
        setTokenInfo(tokenResponse.data.tokenInfo);
      } else {
        setError(t('token.fetchFailed'));
      }
      
      // Get token balance
      const token = localStorage.getItem('authToken');
      if (token && connected) {
        const balanceResponse = await axios.get(`${API_BASE_URL}/wallet/token-balance/${tokenAddress}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (balanceResponse.data.success) {
          setBalance(balanceResponse.data.balance);
        }
      }
    } catch (error: any) {
      console.error('Error fetching token info:', error);
      setError(error.response?.data?.message || t('token.fetchError'));
    } finally {
      setIsLoadingToken(false);
    }
  };

  useEffect(() => {
    if (tokenAddress && connected) {
      fetchTokenInfo();
    }
  }, [tokenAddress, connected]);

  const handleRefresh = () => {
    fetchTokenInfo();
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setIsClipboardCopied(type);
    setTimeout(() => setIsClipboardCopied(null), 2000);
  };

  const validateSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  const onSubmit: SubmitHandler<TransferInputs> = async (data) => {
    if (!connected || !publicKey) {
      setError(t('wallet.pleaseConnect'));
      return;
    }
    
    if (!tokenInfo) {
      setError(t('token.notFound'));
      return;
    }
    
    if (!validateSolanaAddress(data.recipient)) {
      setError(t('transfer.invalidRecipientAddress'));
      return;
    }
    
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      setError(t('transfer.invalidAmount'));
      return;
    }
    
    if (balance !== null && amount > balance) {
      setError(t('transfer.insufficientBalance'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError(t('auth.unauthorized'));
        return;
      }
      
      const transferData = {
        recipient: data.recipient,
        amount,
        tokenAddress: tokenInfo.tokenAddress,
        memo: data.memo || undefined
      };
      
      const response = await axios.post(`${API_BASE_URL}/wallet/transfer-token`, transferData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess(t('transfer.successMessage', { amount, symbol: tokenInfo.symbol, recipient: `${data.recipient.slice(0, 6)}...${data.recipient.slice(-4)}` }));
        setValue('amount', '');
        setValue('memo', '');
        // Refresh balance
        fetchTokenInfo();
      } else {
        setError(response.data.message || t('transfer.failed'));
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      setError(error.response?.data?.message || t('transfer.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Network parameters setup
  const networkParam = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork || WalletAdapterNetwork.Devnet;
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(networkParam);
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: networkParam }),
  ];

  return (
    <>
      <Head>
        <title>{t('transfer.pageTitle')} | DevLaunch</title>
        <meta name="description" content={t('transfer.pageDescription')} />
      </Head>
      
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
              <Navbar />
              
              <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => router.back()}
                    className="p-2 bg-white dark:bg-gray-800 rounded-md shadow hover:bg-gray-50 dark:hover:bg-gray-700 mr-2"
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('transfer.title')}</h1>
                </div>
                
                {!connected ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <div className="text-center py-6">
                      <ExclamationCircleIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t('wallet.pleaseConnect')}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{t('wallet.connectToTransfer')}</p>
                      <div className="flex justify-center">
                        <WalletMultiButton />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {isLoadingToken ? (
                      <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : tokenInfo ? (
                      <div className="space-y-6">
                        {/* Token information card */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center mb-4 md:mb-0">
                              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-4">
                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                  {tokenInfo.symbol.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <Link href={`/token/${tokenInfo.tokenAddress}`}>
                                  <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">
                                    {tokenInfo.name} ({tokenInfo.symbol})
                                  </h2>
                                </Link>
                                <div className="flex items-center">
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                    {tokenInfo.tokenAddress.slice(0, 8)}...{tokenInfo.tokenAddress.slice(-8)}
                                  </p>
                                  <button 
                                    onClick={() => copyToClipboard(tokenInfo.tokenAddress, 'address')}
                                    className="ml-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                  >
                                    {isClipboardCopied === 'address' ? (
                                      <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                    ) : (
                                      <DocumentDuplicateIcon className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col">
                              <p className="text-sm text-gray-500 dark:text-gray-400 text-right">{t('transfer.yourBalance')}</p>
                              <div className="flex items-center">
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                  {balance !== null ? balance.toLocaleString(undefined, { maximumFractionDigits: tokenInfo.decimals }) : '---'} {tokenInfo.symbol}
                                </p>
                                <button 
                                  onClick={handleRefresh}
                                  className="ml-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                  title={t('common.refresh')}
                                >
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Transfer form */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('transfer.sendTokens')}</h3>
                          
                          {error && (
                            <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                              <p>{error}</p>
                            </div>
                          )}
                          
                          {success && (
                            <div className="mb-4 p-4 rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              <p>{success}</p>
                            </div>
                          )}
                          
                          <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('transfer.recipientAddress')}
                              </label>
                              <input
                                {...register('recipient', { required: true })}
                                placeholder={t('transfer.recipientAddressPlaceholder')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              {errors.recipient && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                  {t('transfer.recipientRequired')}
                                </p>
                              )}
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('transfer.amount')}
                              </label>
                              <div className="relative">
                                <input
                                  {...register('amount', { required: true })}
                                  type="number"
                                  step="any"
                                  placeholder="0.00"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <span className="text-gray-500 dark:text-gray-400">{tokenInfo.symbol}</span>
                                </div>
                              </div>
                              {errors.amount && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                  {t('transfer.amountRequired')}
                                </p>
                              )}
                              
                              {balance !== null && amount && !isNaN(parseFloat(amount)) && (
                                <div className="mt-1 flex justify-between text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {t('transfer.maxAvailable')}: {balance.toLocaleString()} {tokenInfo.symbol}
                                  </span>
                                  
                                  <button
                                    type="button"
                                    onClick={() => setValue('amount', balance.toString())}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    {t('transfer.useMax')}
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('transfer.memo')} ({t('common.optional')})
                              </label>
                              <textarea
                                {...register('memo')}
                                rows={3}
                                placeholder={t('transfer.memoPlaceholder')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  {t('common.processing')}...
                                </>
                              ) : (
                                <>
                                  <PaperAirplaneIcon className="h-5 w-5 mr-2 transform rotate-90" />
                                  {t('transfer.sendTokens')}
                                </>
                              )}
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                        <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t('token.notFound')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('token.notFoundMessage')}</p>
                        <Link href="/tokens">
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            {t('token.viewAllTokens')}
                          </button>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

export default TransfersPage; 