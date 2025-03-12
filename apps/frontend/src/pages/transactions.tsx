import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { 
  ArrowPathIcon, 
  ArrowsRightLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import { useTranslation } from '../utils/i18n';

// 导入钱包适配器CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Transaction {
  _id: string;
  transactionId: string;
  type: 'send' | 'receive' | 'create' | 'mint' | 'burn';
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenName?: string;
  amount: number;
  sender: string;
  recipient: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  isSol: boolean;
  fee?: number;
  memo?: string;
}

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isClipboardCopied, setIsClipboardCopied] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'sent' | 'received' | 'create'>('all');
  const [activeTokenFilter, setActiveTokenFilter] = useState<'all' | 'sol' | 'tokens'>('all');
  const { t } = useTranslation();
  const { connected, publicKey } = useWallet();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const ITEMS_PER_PAGE = 10;

  // 获取交易记录
  const fetchTransactions = async (page = 1) => {
    if (!connected) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('未授权，请先登录');
        return;
      }
      
      // 构建查询参数
      let queryParams = `?page=${page}&limit=${ITEMS_PER_PAGE}`;
      
      // 添加类型过滤
      if (activeFilter === 'sent') {
        queryParams += '&type=send';
      } else if (activeFilter === 'received') {
        queryParams += '&type=receive';
      } else if (activeFilter === 'create') {
        queryParams += '&type=create';
      }
      
      // 添加代币类型过滤
      if (activeTokenFilter === 'sol') {
        queryParams += '&isSol=true';
      } else if (activeTokenFilter === 'tokens') {
        queryParams += '&isSol=false';
      }
      
      const response = await axios.get(`${API_BASE_URL}/transactions${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setTransactions(response.data.transactions);
        setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
        setCurrentPage(page);
      } else {
        setError(response.data.message || '获取交易记录失败');
      }
    } catch (error: any) {
      console.error('获取交易记录出错:', error);
      setError(error.response?.data?.message || '获取交易记录时出错');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchTransactions(currentPage);
    }
  }, [connected, activeFilter, activeTokenFilter]);

  const handleRefresh = () => {
    fetchTransactions(currentPage);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchTransactions(page);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setIsClipboardCopied(type);
    setTimeout(() => setIsClipboardCopied(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionTypeText = (type: string, isSol: boolean) => {
    switch (type) {
      case 'send':
        return `发送${isSol ? 'SOL' : '代币'}`;
      case 'receive':
        return `接收${isSol ? 'SOL' : '代币'}`;
      case 'create':
        return '创建代币';
      case 'mint':
        return '铸造代币';
      case 'burn':
        return '销毁代币';
      default:
        return type;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpIcon className="h-5 w-5 text-red-500" />;
      case 'receive':
        return <ArrowDownIcon className="h-5 w-5 text-green-500" />;
      case 'create':
        return <ArrowsRightLeftIcon className="h-5 w-5 text-blue-500" />;
      case 'mint':
        return <ArrowDownIcon className="h-5 w-5 text-purple-500" />;
      case 'burn':
        return <ArrowUpIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ArrowsRightLeftIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
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
        <title>交易历史 | DevLaunch</title>
        <meta name="description" content="查看您在DevLaunch平台上的交易历史记录" />
      </Head>
      
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
              <Navbar />
              
              <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">交易历史</h1>
                  
                  <button
                    onClick={handleRefresh}
                    className="flex items-center p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800"
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-1" />
                    刷新
                  </button>
                </div>
                
                {!connected ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <div className="text-center py-6">
                      <ExclamationCircleIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">请连接您的钱包</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">您需要连接Solana钱包才能查看交易历史</p>
                      <div className="flex justify-center">
                        <WalletMultiButton />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 过滤器 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">交易类型:</span>
                          <div className="mt-2 flex space-x-2">
                            {['all', 'sent', 'received', 'create'].map((filter) => (
                              <button
                                key={filter}
                                onClick={() => setActiveFilter(filter as 'all' | 'sent' | 'received' | 'create')}
                                className={`px-3 py-1 text-sm rounded-md ${
                                  activeFilter === filter 
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {filter === 'all' && '全部'}
                                {filter === 'sent' && '发送'}
                                {filter === 'received' && '接收'}
                                {filter === 'create' && '创建'}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">代币类型:</span>
                          <div className="mt-2 flex space-x-2">
                            {['all', 'sol', 'tokens'].map((filter) => (
                              <button
                                key={filter}
                                onClick={() => setActiveTokenFilter(filter as 'all' | 'sol' | 'tokens')}
                                className={`px-3 py-1 text-sm rounded-md ${
                                  activeTokenFilter === filter 
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {filter === 'all' && '全部'}
                                {filter === 'sol' && 'SOL'}
                                {filter === 'tokens' && '代币'}
                              </button>
                            ))}
                          </div>
                        </div>
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
                    ) : transactions.length > 0 ? (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  类型
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  代币
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  金额
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  发送方/接收方
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  状态
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  时间
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  交易ID
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {getTransactionTypeIcon(tx.type)}
                                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-200">
                                        {getTransactionTypeText(tx.type, tx.isSol)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {tx.isSol ? (
                                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">SOL</span>
                                    ) : tx.tokenAddress ? (
                                      <Link href={`/token/${tx.tokenAddress}`}>
                                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                                          {tx.tokenSymbol || '未知代币'}
                                        </span>
                                      </Link>
                                    ) : (
                                      <span className="text-sm text-gray-500 dark:text-gray-400">未知代币</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-sm font-medium ${
                                      tx.type === 'receive' || tx.type === 'mint' 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : tx.type === 'send' || tx.type === 'burn'
                                          ? 'text-red-600 dark:text-red-400'
                                          : 'text-gray-900 dark:text-gray-200'
                                    }`}>
                                      {tx.type === 'receive' || tx.type === 'mint' ? '+' : tx.type === 'send' || tx.type === 'burn' ? '-' : ''}
                                      {tx.amount.toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {tx.type === 'send' ? (
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        发送至 <span className="font-medium text-gray-900 dark:text-gray-200">{truncateAddress(tx.recipient)}</span>
                                      </div>
                                    ) : tx.type === 'receive' ? (
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        来自 <span className="font-medium text-gray-900 dark:text-gray-200">{truncateAddress(tx.sender)}</span>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-500 dark:text-gray-400">-</div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(tx.status)}`}>
                                      {tx.status === 'confirmed' && '已确认'}
                                      {tx.status === 'pending' && '处理中'}
                                      {tx.status === 'failed' && '失败'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(tx.timestamp)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <a 
                                        href={`https://explorer.solana.com/tx/${tx.transactionId}?cluster=${network}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mr-2"
                                      >
                                        {truncateAddress(tx.transactionId)}
                                      </a>
                                      <button
                                        onClick={() => copyToClipboard(tx.transactionId, tx._id)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                      >
                                        {isClipboardCopied === tx._id ? (
                                          <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <DocumentDuplicateIcon className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* 分页 */}
                        {totalPages > 1 && (
                          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                  currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                              >
                                上一页
                              </button>
                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                  currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                              >
                                下一页
                              </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  显示第 <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> 至 
                                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}</span> 条，
                                  共 <span className="font-medium">{transactions.length}</span> 条记录
                                </p>
                              </div>
                              <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                  <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                      currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                                        : 'text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    <span className="sr-only">上一页</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                      key={page}
                                      onClick={() => handlePageChange(page)}
                                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        page === currentPage
                                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-300'
                                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                      currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                                        : 'text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    <span className="sr-only">下一页</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </nav>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">暂无交易记录</p>
                        <Link href="/wallet">
                          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            前往钱包
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

export default TransactionsPage; 