import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ExclamationCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import { useTranslation } from '../utils/i18n';
import { CreateTokenInputs } from '../types/token';
import { TOKEN_FORM_TOOLTIPS, ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/tooltips';
import FormInput from '../components/form/FormInput';
import FormTextarea from '../components/form/FormTextarea';
import AlertMessage from '../components/ui/AlertMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { tokenService } from '../services/api';

const CreateTokenPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdToken, setCreatedToken] = useState<any>(null);
  const { t } = useTranslation();
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTokenInputs>({
    defaultValues: {
      decimals: 9,
      totalSupply: 1000000000,
    }
  });
  
  useEffect(() => {
    // Check if user is logged in
    if (!tokenService.isAuthenticated()) {
      router.push(`${ROUTES.LOGIN}?redirect=${ROUTES.CREATE_TOKEN}`);
    }
  }, [router]);

  const onSubmit: SubmitHandler<CreateTokenInputs> = async (data) => {
    if (!connected || !publicKey) {
      setError(ERROR_MESSAGES.WALLET_CONNECTION_REQUIRED);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await tokenService.createToken(data);
      
      if (result.success && result.token) {
        setSuccess(true);
        setCreatedToken(result.token);
      } else {
        setError(result.message || ERROR_MESSAGES.TOKEN_CREATE_FAILED);
      }
    } catch (error: any) {
      console.error('Token creation error:', error);
      setError(error.message || ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('token.create')} | DevLaunch</title>
        <meta name="description" content="Create your own SPL token on Solana blockchain" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('token.create')}</h1>
          
          {!connected ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="text-center py-6">
                <ExclamationCircleIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {t('wallet.connect')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You need to connect your Solana wallet to create a token
                </p>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              </div>
            </div>
          ) : success ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <SparklesIcon className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {SUCCESS_MESSAGES.TOKEN_CREATED}
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('token.name')}</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{createdToken.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('token.symbol')}</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{createdToken.symbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('token.decimals')}</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{createdToken.decimals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('token.supply')}</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{createdToken.totalSupply.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('token.address')}</p>
                      <p className="font-mono text-sm break-all text-gray-900 dark:text-white">{createdToken.tokenAddress}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push(ROUTES.TOKEN_DETAILS(createdToken.tokenAddress))}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Token Details
                  </button>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setCreatedToken(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Create Another Token
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Create your own SPL token on the Solana blockchain.
                  The token will be minted to your connected wallet address.
                  Please ensure you have enough SOL to pay for transaction fees.
                </p>
              </div>
              
              {error && <AlertMessage type="error" message={error} />}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Token Name */}
                  <FormInput
                    id="name"
                    label={t('token.name')}
                    type="text"
                    placeholder="e.g., Solana"
                    register={register("name", { 
                      required: "Token name is required",
                      minLength: { value: 2, message: "Token name must be at least 2 characters" },
                      maxLength: { value: 50, message: "Token name cannot exceed 50 characters" }
                    })}
                    error={errors.name}
                    required={true}
                    tooltip={TOKEN_FORM_TOOLTIPS.name}
                  />
                  
                  {/* Token Symbol */}
                  <FormInput
                    id="symbol"
                    label={t('token.symbol')}
                    type="text"
                    placeholder="e.g., SOL"
                    register={register("symbol", { 
                      required: "Token symbol is required",
                      minLength: { value: 2, message: "Token symbol must be at least 2 characters" },
                      maxLength: { value: 10, message: "Token symbol cannot exceed 10 characters" },
                      pattern: { value: /^[A-Za-z0-9]+$/, message: "Token symbol can only contain letters and numbers" }
                    })}
                    error={errors.symbol}
                    required={true}
                    tooltip={TOKEN_FORM_TOOLTIPS.symbol}
                  />
                  
                  {/* Decimals */}
                  <FormInput
                    id="decimals"
                    label={t('token.decimals')}
                    type="number"
                    placeholder="9"
                    register={register("decimals", { 
                      required: "Decimals is required",
                      min: { value: 0, message: "Decimals cannot be less than 0" },
                      max: { value: 9, message: "Decimals cannot exceed 9" },
                      valueAsNumber: true
                    })}
                    error={errors.decimals}
                    required={true}
                    tooltip={TOKEN_FORM_TOOLTIPS.decimals}
                  />
                  
                  {/* Total Supply */}
                  <FormInput
                    id="totalSupply"
                    label={t('token.supply')}
                    type="number"
                    placeholder="1000000000"
                    register={register("totalSupply", { 
                      required: "Total supply is required",
                      min: { value: 1, message: "Total supply cannot be less than 1" },
                      valueAsNumber: true
                    })}
                    error={errors.totalSupply}
                    required={true}
                    tooltip={TOKEN_FORM_TOOLTIPS.totalSupply}
                  />
                </div>
                
                {/* Description */}
                <FormTextarea
                  id="description"
                  label={t('token.description')}
                  placeholder="Describe your token project..."
                  register={register("description", {
                    maxLength: { value: 500, message: "Description cannot exceed 500 characters" }
                  })}
                  error={errors.description}
                  tooltip={TOKEN_FORM_TOOLTIPS.description}
                  rows={3}
                />
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Links (Optional)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Website */}
                    <FormInput
                      id="website"
                      label="Website"
                      type="text"
                      placeholder="https://example.com"
                      register={register("website", {
                        pattern: { value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, message: "Please enter a valid URL" }
                      })}
                      error={errors.website}
                      tooltip={TOKEN_FORM_TOOLTIPS.website}
                    />
                    
                    {/* Twitter */}
                    <FormInput
                      id="twitter"
                      label="Twitter"
                      type="text"
                      placeholder="username"
                      register={register("twitter")}
                      prefix="@"
                      tooltip={TOKEN_FORM_TOOLTIPS.twitter}
                    />
                    
                    {/* Telegram */}
                    <FormInput
                      id="telegram"
                      label="Telegram"
                      type="text"
                      placeholder="channelname"
                      register={register("telegram")}
                      prefix="@"
                      tooltip={TOKEN_FORM_TOOLTIPS.telegram}
                    />
                    
                    {/* GitHub */}
                    <FormInput
                      id="github"
                      label="GitHub"
                      type="text"
                      placeholder="username"
                      register={register("github")}
                      tooltip={TOKEN_FORM_TOOLTIPS.github}
                    />
                  </div>
                </div>
                
                {/* Fee notice */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-600 dark:text-gray-300">
                  <p className="mb-2">Note: Creating a token will require Solana network fees, ensure you have enough SOL in your wallet.</p>
                  <p>The created token will be minted to your connected wallet address.</p>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Token"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateTokenPage; 