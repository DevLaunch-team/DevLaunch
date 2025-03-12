import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useTranslation } from '../utils/i18n';

// 导入钱包适配器CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Token {
  _id: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  creator: {
    _id: string;
    username: string;
  };
  creatorWallet: string;
  description: string;
  totalSupply: number;
  decimals: number;
  launchDate: string;
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image?: string;
  };
}

const TokensPage: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { t, locale } = useTranslation('wallet');
  
  // 你可以改变网络为 'devnet', 'testnet', 或 'mainnet-beta'
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork || WalletAdapterNetwork.Devnet;
  
  // 你也可以提供自定义RPC端点
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network);
  
  // @solana/wallet-adapter-wallets 包含所有适配器但支持树摇
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
  ];

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const fetchTokens = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('需要认证，请先登录。');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/tokens/user-tokens`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setTokens(response.data.tokens);
      } else {
        setError(response.data.message || '获取令牌失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '获取令牌时出错');
      console.error('获取令牌出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Head>
        <title>我的代币 | DevLaunch</title>
        <meta name="description" content="管理您的Solana SPL代币" />
      </Head>
      
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-12 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">我的代币</h1>
                  <Link href="/create-token">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition">
                      创建新代币
                    </button>
                  </Link>
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
                ) : tokens.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">您还没有创建任何代币</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">创建您的第一个Solana SPL代币来开始您的项目</p>
                    <Link href="/create-token">
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition">
                        创建代币
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tokens.map((token) => (
                      <div key={token._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{token.name}</h2>
                              <p className="text-indigo-600 dark:text-indigo-400 font-medium">{token.symbol}</p>
                            </div>
                            <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded">
                              {token.decimals} 位小数
                            </div>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {token.description || '无描述'}
                          </p>
                          
                          <div className="mb-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">代币地址</div>
                            <a 
                              href={`https://explorer.solana.com/address/${token.tokenAddress}?cluster=${network}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-sm"
                            >
                              {truncateAddress(token.tokenAddress)}
                            </a>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <div className="text-gray-500 dark:text-gray-400">总供应量</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">
                                {token.totalSupply.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500 dark:text-gray-400">发布日期</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">
                                {formatDate(token.launchDate)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex space-x-3">
                            <Link href={`/token/${token.tokenAddress}`}>
                              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition text-sm">
                                详情
                              </button>
                            </Link>
                            <Link href={`/transfers?token=${token.tokenAddress}`}>
                              <button className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-4 rounded-md transition text-sm dark:hover:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-400">
                                转账
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

export default TokensPage; 