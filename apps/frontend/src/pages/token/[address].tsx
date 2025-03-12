import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { format } from 'date-fns';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { 
  ArrowPathIcon, 
  ClipboardDocumentCheckIcon,
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../utils/i18n';
import Navbar from '../../components/Navbar';

// 导入钱包适配器CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface TokenDetails {
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
  metadata?: {
    name: string;
    symbol: string;
    description: string;
    image?: string;
  };
  balance?: number;
  holders?: number;
  website?: string;
  social?: {
    twitter?: string;
    telegram?: string;
    github?: string;
  };
}

const TokenPage: React.FC = () => {
  const [token, setToken] = useState<TokenDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClipboardCopied, setIsClipboardCopied] = useState<string | null>(null);
  const { t } = useTranslation();
  const router = useRouter();
  const { address } = router.query;
  const { connected } = useWallet();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  const fetchTokenDetails = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // 获取代币详情
      const tokenResponse = await axios.get(`${API_BASE_URL}/wallet/token-info/${address}`);
      
      // 获取代币在数据库中的元数据和其他信息
      const metadataResponse = await axios.get(`${API_BASE_URL}/tokens/${address}`);
      
      // 获取代币余额
      const token = localStorage.getItem('authToken');
      let balanceResponse = null;
      
      if (token) {
        balanceResponse = await axios.get(`${API_BASE_URL}/wallet/token-balance/${address}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      if (tokenResponse.data.success && metadataResponse.data.success) {
        // 组合数据
        const tokenData = {
          ...metadataResponse.data.token,
          ...tokenResponse.data.tokenInfo,
          holders: 1 + Math.floor(Math.random() * 50), // 模拟持有者数量，实际应该从API获取
          balance: balanceResponse?.data.success ? balanceResponse.data.balance : 0
        };
        
        setToken(tokenData);
      } else {
        setError('获取代币信息失败');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '获取代币信息时出错');
      console.error('获取代币信息出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTokenDetails();
    }
  }, [address, connected]);

  const handleRefresh = () => {
    fetchTokenDetails();
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setIsClipboardCopied(type);
    setTimeout(() => setIsClipboardCopied(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const truncateAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 网络参数设置
  const networkParam = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork || WalletAdapterNetwork.Devnet;
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(networkParam);
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: networkParam }),
  ];

  return (
    <>
      <Head>
        <title>{token ? `${token.name} (${token.symbol}) | DevLaunch` : '代币详情 | DevLaunch'}</title>
        <meta name="description" content={token ? `查看 ${token.name} 代币的详细信息` : '查看Solana代币的详细信息'} />
      </Head>
      
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
              <Navbar />
              
              <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.back()}
                      className="p-2 bg-white dark:bg-gray-800 rounded-md shadow hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">代币详情</h1>
                  </div>
                  
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
                ) : token ? (
                  <div className="space-y-6">
                    {/* 代币基本信息卡片 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                          <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mr-4">
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                              {token.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{token.name}</h2>
                            <div className="flex items-center mt-1">
                              <span className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mr-2">{token.symbol}</span>
                              <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded">
                                {token.decimals} 位小数
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <a 
                            href={`https://explorer.solana.com/address/${token.tokenAddress}?cluster=${network}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md dark:hover:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-400 text-sm"
                          >
                            Solana浏览器
                          </a>
                          <Link href={`/transfers?token=${token.tokenAddress}`}>
                            <button className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm">
                              <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                              转账
                            </button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">代币地址</h3>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                          <code className="font-mono text-sm break-all text-gray-800 dark:text-gray-200">
                            {token.tokenAddress}
                          </code>
                          <button
                            onClick={() => copyToClipboard(token.tokenAddress, 'address')}
                            className="ml-2 flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            {isClipboardCopied === 'address' ? (
                              <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <DocumentDuplicateIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {token.description && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">描述</h3>
                          <p className="text-gray-600 dark:text-gray-300">{token.description}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* 代币数据卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* 总供应量 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">总供应量</h3>
                        <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                          {token.totalSupply.toLocaleString()}
                        </p>
                      </div>
                      
                      {/* 持有者数量 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">持有者数量</h3>
                        <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                          {token.holders}
                        </p>
                      </div>
                      
                      {/* 您的余额 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">您的余额</h3>
                        <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                          {token.balance ? token.balance.toLocaleString() : (connected ? '0' : '未连接钱包')}
                        </p>
                      </div>
                      
                      {/* 创建日期 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">创建日期</h3>
                        <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                          {formatDate(token.launchDate)}
                        </p>
                      </div>
                    </div>
                    
                    {/* 创建者信息 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">创建者信息</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">创建者: </span>
                          <span className="font-medium text-gray-900 dark:text-white">{token.creator.username}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">创建者钱包: </span>
                          <a 
                            href={`https://explorer.solana.com/address/${token.creatorWallet}?cluster=${network}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {truncateAddress(token.creatorWallet)}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    {/* 网站和社交媒体 */}
                    {(token.website || (token.social && Object.values(token.social).some(v => v))) && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">链接</h3>
                        <div className="space-y-3">
                          {token.website && (
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">官网: </span>
                              <a 
                                href={token.website.startsWith('http') ? token.website : `https://${token.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {token.website}
                              </a>
                            </div>
                          )}
                          {token.social?.twitter && (
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Twitter: </span>
                              <a 
                                href={`https://twitter.com/${token.social.twitter.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {token.social.twitter}
                              </a>
                            </div>
                          )}
                          {token.social?.telegram && (
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Telegram: </span>
                              <a 
                                href={`https://t.me/${token.social.telegram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {token.social.telegram}
                              </a>
                            </div>
                          )}
                          {token.social?.github && (
                            <div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">GitHub: </span>
                              <a 
                                href={`https://github.com/${token.social.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {token.social.github}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-300">未找到代币信息</p>
                  </div>
                )}
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

export default TokenPage; 