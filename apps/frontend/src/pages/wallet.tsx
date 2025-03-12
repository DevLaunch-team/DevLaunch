import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { 
  CurrencyDollarIcon, 
  ArrowPathIcon, 
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n';
import Navbar from '../components/Navbar';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Token {
  symbol: string;
  name: string;
  balance: number;
  tokenAddress: string;
  decimals: number;
}

const WalletContent: React.FC = () => {
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClipboardCopied, setIsClipboardCopied] = useState(false);
  const { t } = useTranslation('wallet');
  const { publicKey, connected } = useWallet();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  const fetchBalances = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('需要认证，请先登录。');
        setIsLoading(false);
        return;
      }
      
      // 获取SOL余额
      const solResponse = await axios.get(`${API_BASE_URL}/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (solResponse.data.success) {
        setSolBalance(solResponse.data.balance);
      }
      
      // 获取用户代币
      const tokensResponse = await axios.get(`${API_BASE_URL}/tokens/user-tokens`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (tokensResponse.data.success) {
        // 获取每个代币的余额
        const userTokens = tokensResponse.data.tokens;
        const tokenBalancePromises = userTokens.map(async (token: any) => {
          try {
            const balanceResponse = await axios.get(
              `${API_BASE_URL}/wallet/token-balance/${token.tokenAddress}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            return {
              ...token,
              balance: balanceResponse.data.success ? balanceResponse.data.balance : 0
            };
          } catch (error) {
            console.error(`Error getting balance for token ${token.symbol}:`, error);
            return {
              ...token,
              balance: 0
            };
          }
        });
        
        const tokensWithBalances = await Promise.all(tokenBalancePromises);
        setTokens(tokensWithBalances);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '获取钱包数据时出错');
      console.error('获取钱包数据出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchBalances();
    }
  }, [connected]);

  const handleRefresh = () => {
    fetchBalances();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsClipboardCopied(true);
    setTimeout(() => setIsClipboardCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 如果没有连接钱包
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CurrencyDollarIcon className="h-16 w-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            连接您的钱包
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            请连接您的 Solana 钱包以查看您的余额和代币。
          </p>
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">我的钱包</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800"
        >
          <ArrowPathIcon className="h-5 w-5 mr-1" />
          刷新
        </button>
      </div>
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* 钱包地址 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                钱包地址
              </h2>
              <button
                onClick={() => publicKey && copyToClipboard(publicKey.toString())}
                className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                {isClipboardCopied ? "已复制！" : "复制"}
              </button>
            </div>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md font-mono text-sm break-all">
              {publicKey ? publicKey.toString() : "未连接钱包"}
            </div>
          </div>
          
          {/* SOL 余额 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                SOL 余额
              </h2>
              <div className="flex space-x-2">
                <Link href="/transfers">
                  <button className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md">
                    <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                    转账
                  </button>
                </Link>
              </div>
            </div>
            <div className="mt-4 flex items-end">
              <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                {solBalance !== null ? solBalance.toFixed(6) : '0.000000'}
              </span>
              <span className="ml-2 text-lg text-gray-600 dark:text-gray-400">SOL</span>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              ≈ ${solBalance !== null ? (solBalance * 150).toFixed(2) : '0.00'} USD
            </div>
          </div>
          
          {/* 代币列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                代币
              </h2>
              <div className="flex space-x-2">
                <Link href="/create-token">
                  <button className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md">
                    <PlusCircleIcon className="h-4 w-4 mr-1" />
                    创建代币
                  </button>
                </Link>
              </div>
            </div>
            
            {tokens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">您还没有任何代币</p>
                <Link href="/create-token">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition">
                    创建您的第一个代币
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        代币
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        余额
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tokens.map((token) => (
                      <tr key={token.tokenAddress} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                {token.symbol.substring(0, 2)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {token.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {token.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {token.balance.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <a 
                              href={`https://explorer.solana.com/address/${token.tokenAddress}?cluster=${network}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              {truncateAddress(token.tokenAddress)}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/token/${token.tokenAddress}`}>
                              <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                详情
                              </button>
                            </Link>
                            <Link href={`/transfers?token=${token.tokenAddress}`}>
                              <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                转账
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const WalletPage: React.FC = () => {
  // 你可以改变网络为 'devnet', 'testnet', 或 'mainnet-beta'
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork || WalletAdapterNetwork.Devnet;
  
  // 你也可以提供自定义RPC端点
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network);
  
  // @solana/wallet-adapter-wallets 包含所有适配器但支持树摇
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
  ];

  return (
    <>
      <Head>
        <title>我的钱包 | DevLaunch</title>
        <meta name="description" content="管理您的Solana钱包和代币" />
      </Head>
      
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
              <Navbar />
              <WalletContent />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

export default WalletPage; 