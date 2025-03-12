import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ClockIcon,
  UserIcon,
  PlusCircleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n';
import Navbar from '../components/Navbar';

// 导入钱包适配器CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface DashboardData {
  solBalance: number;
  totalTokens: number;
  tokensCreated: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  _id: string;
  transactionType: string;
  amount?: number;
  tokenSymbol?: string;
  recipient?: string;
  txSignature: string;
  status: string;
  createdAt: string;
}

const DashboardContent: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const { t } = useTranslation();
  const { connected } = useWallet();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  useEffect(() => {
    // 检查用户是否已登录
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
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
      
      // 获取用户代币
      const tokensResponse = await axios.get(`${API_BASE_URL}/tokens/user-tokens`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // 获取交易历史
      const transactionsResponse = await axios.get(`${API_BASE_URL}/wallet/transactions?limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // 组合数据
      const data: DashboardData = {
        solBalance: solResponse.data.success ? solResponse.data.balance : 0,
        totalTokens: 0,
        tokensCreated: tokensResponse.data.success ? tokensResponse.data.tokens.length : 0,
        recentTransactions: transactionsResponse.data.success ? transactionsResponse.data.transactions : []
      };
      
      // 统计所有代币的总数量
      if (tokensResponse.data.success) {
        const tokens = tokensResponse.data.tokens;
        
        for (const token of tokens) {
          try {
            const balanceResponse = await axios.get(
              `${API_BASE_URL}/wallet/token-balance/${token.tokenAddress}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            if (balanceResponse.data.success) {
              data.totalTokens += balanceResponse.data.balance;
            }
          } catch (error) {
            console.error(`Error getting balance for token ${token.symbol}:`, error);
          }
        }
      }
      
      setDashboardData(data);
    } catch (error: any) {
      setError(error.response?.data?.message || '获取仪表盘数据时出错');
      console.error('获取仪表盘数据出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 如果未登录
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <UserIcon className="h-16 w-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            请先登录
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            您需要登录以访问您的仪表盘和管理您的代币。
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition">
                登录
              </button>
            </Link>
            <Link href="/register">
              <button className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-4 rounded-md transition dark:hover:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-400">
                注册
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 如果未连接钱包
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CurrencyDollarIcon className="h-16 w-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            连接您的钱包
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            请连接您的 Solana 钱包以查看您的仪表盘数据。
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
        <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">仪表盘</h1>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-300">欢迎回来，</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">{username}</span>
        </div>
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
          {/* 数据卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* SOL余额卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SOL余额</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {dashboardData?.solBalance.toFixed(4)} SOL
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ≈ ${dashboardData ? (dashboardData.solBalance * 150).toFixed(2) : '0.00'} USD
                  </p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                  <CurrencyDollarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/wallet">
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    查看钱包 &rarr;
                  </button>
                </Link>
              </div>
            </div>
            
            {/* 代币总数卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">代币总数</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {dashboardData?.totalTokens.toLocaleString()}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    所有代币的总数量
                  </p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                  <ChartBarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/tokens">
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    查看所有代币 &rarr;
                  </button>
                </Link>
              </div>
            </div>
            
            {/* 已创建代币卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">已创建代币</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {dashboardData?.tokensCreated}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    您创建的代币数量
                  </p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                  <PlusCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/create-token">
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    创建新代币 &rarr;
                  </button>
                </Link>
              </div>
            </div>
            
            {/* 最近交易卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">最近交易</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {dashboardData?.recentTransactions.length || 0}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    最近5笔交易
                  </p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                  <ArrowsRightLeftIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/transfers">
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    查看所有交易 &rarr;
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* 最近交易 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                最近交易
              </h2>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400">最近活动</span>
              </div>
            </div>
            
            {dashboardData?.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">您还没有任何交易记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        类型
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        日期
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        金额
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        状态
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        签名
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {dashboardData?.recentTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {tx.transactionType === 'token-creation' ? '创建代币' :
                             tx.transactionType === 'sol-transfer' ? 'SOL转账' :
                             tx.transactionType === 'token-transfer' ? '代币转账' : tx.transactionType}
                          </div>
                          {tx.tokenSymbol && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {tx.tokenSymbol}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tx.amount ? (
                            <div className="text-sm text-gray-900 dark:text-white">
                              {tx.amount} {tx.transactionType === 'sol-transfer' ? 'SOL' : tx.tokenSymbol || ''}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full 
                            ${tx.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                              tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {tx.status === 'confirmed' ? '已确认' : 
                             tx.status === 'pending' ? '处理中' : '失败'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a 
                            href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=${network}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            {truncateAddress(tx.txSignature)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/transfers">
                <button className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md dark:hover:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-400">
                  查看所有交易
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const DashboardPage: React.FC = () => {
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
        <title>仪表盘 | DevLaunch</title>
        <meta name="description" content="DevLaunch - 您的 Solana 代币创建和管理平台" />
      </Head>
      
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
              <Navbar />
              <DashboardContent />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};

export default DashboardPage; 