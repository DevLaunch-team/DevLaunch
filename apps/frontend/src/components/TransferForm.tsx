import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';

interface TransferFormProps {
  className?: string;
  type: 'sol' | 'token';
}

type TransferFormInputs = {
  recipientAddress: string;
  amount: number;
  tokenAddress?: string;
};

const TransferForm: React.FC<TransferFormProps> = ({ className, type }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TransferFormInputs>();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const onSubmit: SubmitHandler<TransferFormInputs> = async (data) => {
    setIsSubmitting(true);
    setError('');
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please login first.');
        setIsSubmitting(false);
        return;
      }

      const endpoint = type === 'sol' ? 'transfer-sol' : 'transfer-token';
      
      const response = await axios.post(`${API_BASE_URL}/wallet/${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess(response.data);
        reset();
      } else {
        setError(response.data.message || `Failed to transfer ${type === 'sol' ? 'SOL' : 'tokens'}`);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || `Error transferring ${type === 'sol' ? 'SOL' : 'tokens'}`);
      console.error(`Error transferring ${type}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {type === 'sol' ? 'Transfer SOL' : 'Transfer Tokens'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          <p className="font-medium">Transfer successful!</p>
          <div className="mt-2 text-sm">
            <p>Transaction signature: <span className="font-mono">{success.txSignature.slice(0, 8)}...{success.txSignature.slice(-8)}</span></p>
            <p>Amount: {success.amount} {type === 'sol' ? 'SOL' : success.tokenSymbol || 'tokens'}</p>
            <p>Recipient: {success.recipientAddress.slice(0, 8)}...{success.recipientAddress.slice(-8)}</p>
          </div>
          <div className="mt-2">
            <a 
              href={`https://explorer.solana.com/tx/${success.txSignature}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              View on Solana Explorer
            </a>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address <span className="text-red-500">*</span>
          </label>
          <input
            {...register("recipientAddress", { 
              required: "Recipient address is required",
              minLength: {
                value: 32,
                message: "Please enter a valid Solana address"
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter Solana wallet address"
          />
          {errors.recipientAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.recipientAddress.message}</p>
          )}
        </div>
        
        {type === 'token' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register("tokenAddress", { 
                required: "Token address is required",
                minLength: {
                  value: 32,
                  message: "Please enter a valid token address"
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter SPL token address"
            />
            {errors.tokenAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.tokenAddress.message}</p>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step={type === 'sol' ? '0.000001' : '1'}
            {...register("amount", { 
              required: "Amount is required",
              min: {
                value: 0.000001,
                message: "Amount must be greater than 0"
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Enter amount of ${type === 'sol' ? 'SOL' : 'tokens'}`}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : `Transfer ${type === 'sol' ? 'SOL' : 'Tokens'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferForm; 