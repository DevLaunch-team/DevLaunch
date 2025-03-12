import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useForm, SubmitHandler } from 'react-hook-form';

type TokenFormInputs = {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  description: string;
  logo?: FileList;
  websiteUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
};

const TokenCreator: React.FC = () => {
  const { connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdToken, setCreatedToken] = useState<any>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TokenFormInputs>({
    defaultValues: {
      decimals: 9,
      initialSupply: '1000000',
    }
  });
  
  const onSubmit: SubmitHandler<TokenFormInputs> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // This would connect to your backend API in a real app
      console.log('Creating token with data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response
      setCreatedToken({
        name: data.name,
        symbol: data.symbol,
        address: '7FGgHiFVaJFwdDGQZJhEwLkrPmcSzxS5zXo38wu5eimD', // Sample address
        decimals: data.decimals,
        initialSupply: data.initialSupply,
        txId: '5UfDMVnUBcuD9ThhCwnyLKEueWYQBrZ8VV2CWKhAsMGKyZF7u4UhnHQmu2J4nwipL9QQJUyFL24jEYDuQn6ehTvZ',
      });
      
      // Move to the confirmation step
      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Failed to create token. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Watch the form values
  const tokenSymbol = watch('symbol', '');
  const tokenName = watch('name', '');
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Basic Token Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block font-medium">Token Name*</label>
          <input
            type="text"
            {...register('name', { required: 'Token name is required' })}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="e.g. My Awesome Token"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="block font-medium">Token Symbol*</label>
          <input
            type="text"
            {...register('symbol', { 
              required: 'Symbol is required', 
              maxLength: { value: 10, message: 'Symbol must be 10 characters or less' },
              pattern: { value: /^[A-Za-z0-9]+$/, message: 'Symbol can only contain letters and numbers' }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="e.g. TAT"
          />
          {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="block font-medium">Decimals*</label>
          <input
            type="number"
            {...register('decimals', { 
              required: 'Decimals is required',
              min: { value: 0, message: 'Minimum value is 0' },
              max: { value: 9, message: 'Maximum value is 9' }
            })}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
          {errors.decimals && <p className="text-red-500 text-sm">{errors.decimals.message}</p>}
          <p className="text-gray-400 text-xs">Recommended: 9 for utility tokens, 0 for NFTs</p>
        </div>
        
        <div className="space-y-2">
          <label className="block font-medium">Initial Supply*</label>
          <input
            type="text"
            {...register('initialSupply', { required: 'Initial supply is required' })}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
          {errors.initialSupply && <p className="text-red-500 text-sm">{errors.initialSupply.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block font-medium">Description</label>
        <textarea
          {...register('description')}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
          rows={4}
          placeholder="Tell us about your token..."
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
        >
          Next
        </button>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Additional Information</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block font-medium">Logo Image</label>
          <input
            type="file"
            {...register('logo')}
            accept="image/png, image/jpeg, image/gif"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-gray-400 text-xs">Recommended: 200x200px PNG or JPG</p>
        </div>
        
        <div className="space-y-2">
          <label className="block font-medium">Website URL</label>
          <input
            type="url"
            {...register('websiteUrl')}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="https://www.example.com"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block font-medium">Twitter URL</label>
          <input
            type="url"
            {...register('twitterUrl')}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="https://twitter.com/yourusername"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block font-medium">GitHub URL</label>
          <input
            type="url"
            {...register('githubUrl')}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="https://github.com/yourusername"
          />
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold"
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Token'}
        </button>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-block p-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Token Created Successfully!</h2>
        <p className="text-gray-400 mb-6">Your token has been created and is ready to use.</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="font-medium text-gray-400">Token Name</span>
          <span className="font-bold">{createdToken.name}</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="font-medium text-gray-400">Token Symbol</span>
          <span className="font-bold">{createdToken.symbol}</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="font-medium text-gray-400">Token Address</span>
          <div className="flex items-center">
            <span className="font-mono text-sm truncate max-w-[200px]">{createdToken.address}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(createdToken.address)}
              className="ml-2 text-blue-400 hover:text-blue-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="font-medium text-gray-400">Initial Supply</span>
          <span className="font-bold">{createdToken.initialSupply}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-400">Transaction</span>
          <a 
            href={`https://explorer.solana.com/tx/${createdToken.txId}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center"
          >
            View on Explorer
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={() => window.location.href = `/token/${createdToken.address}`}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold"
        >
          View Token Dashboard
        </button>
        
        <button
          type="button"
          onClick={() => window.location.href = `/create-trading-pair/${createdToken.address}`}
          className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold"
        >
          Create Trading Pair
        </button>
      </div>
    </div>
  );
  
  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Connect Wallet to Create Token</h1>
          <p className="text-gray-400">You need to connect your Solana wallet to create a token.</p>
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Token</h1>
        <p className="text-gray-400">Launch your own SPL token on Solana with just a few clicks.</p>
      </div>
      
      {/* Progress Steps */}
      <div className="flex mb-8">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-700'} text-white font-bold`}>
            1
          </div>
          <div className="text-xs mt-1">Basics</div>
        </div>
        <div className={`flex-1 h-1 my-4 mx-2 ${currentStep >= 2 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-700'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-700'} text-white font-bold`}>
            2
          </div>
          <div className="text-xs mt-1">Details</div>
        </div>
        <div className={`flex-1 h-1 my-4 mx-2 ${currentStep >= 3 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-700'}`}></div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-700'} text-white font-bold`}>
            3
          </div>
          <div className="text-xs mt-1">Complete</div>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-xl p-6 shadow-xl">
        <form>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </form>
      </div>
      
      {currentStep < 3 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            By creating a token, you agree to our{' '}
            <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>.
          </p>
        </div>
      )}
    </div>
  );
};

export default TokenCreator; 