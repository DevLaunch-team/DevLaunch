import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useWallet } from '@/contexts/WalletContext';

type TokenFormData = {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  description: string;
  imageUrl: string;
  tokenType: string;
  mintAuthority: string;
  freezeAuthority: boolean;
};

const tokenTemplates = [
  { id: 'standard', name: 'Standard Token', description: 'Basic SPL token with customizable supply' },
  { id: 'governance', name: 'Governance Token', description: 'Token with governance rights for DAOs' },
  { id: 'utility', name: 'Utility Token', description: 'Token designed for specific platform utility' },
  { id: 'nft', name: 'NFT Collection', description: 'Create an NFT collection with multiple tokens' },
];

export default function CreateToken() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const { register, handleSubmit, formState: { errors } } = useForm<TokenFormData>();

  const onSubmit = (data: TokenFormData) => {
    console.log(data);
    // Would integrate with backend to deploy token
    alert('Token creation initiated! Check dashboard for status.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
      <Head>
        <title>Create Token | DevLaunch</title>
        <meta name="description" content="Create your own token on Solana in minutes" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Create Your Token</h1>
          <p className="text-lg">Design, deploy, and distribute your Solana token with a few simple steps.</p>
        </div>

        <div className="flex mb-8">
          <div className={`px-4 py-2 ${currentStep >= 1 ? 'bg-indigo-600' : 'bg-gray-700'} rounded-l-lg`}>
            1. Select Template
          </div>
          <div className={`px-4 py-2 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-700'}`}>
            2. Configure Token
          </div>
          <div className={`px-4 py-2 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-700'} rounded-r-lg`}>
            3. Review & Deploy
          </div>
        </div>

        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Select a Token Template</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {tokenTemplates.map((template) => (
                <div 
                  key={template.id}
                  className={`border p-4 rounded-lg cursor-pointer ${selectedTemplate === template.id ? 'border-indigo-500 bg-gray-800' : 'border-gray-700'}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <h3 className="text-xl font-medium mb-2">{template.name}</h3>
                  <p className="text-gray-300">{template.description}</p>
                </div>
              ))}
            </div>
            <button 
              className="btn-primary mt-4" 
              onClick={() => selectedTemplate && setCurrentStep(2)}
              disabled={!selectedTemplate}
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Configure Your Token</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="block mb-1">Token Name</label>
                  <input 
                    {...register('name', { required: true })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                    placeholder="My Awesome Token"
                  />
                  {errors.name && <span className="text-red-500 text-sm">Required</span>}
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">Token Symbol</label>
                  <input 
                    {...register('symbol', { required: true, maxLength: 10 })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                    placeholder="MAT"
                  />
                  {errors.symbol && <span className="text-red-500 text-sm">Required (max 10 chars)</span>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="block mb-1">Decimals</label>
                  <input 
                    type="number"
                    {...register('decimals', { required: true, min: 0, max: 9 })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                    placeholder="9"
                    defaultValue={9}
                  />
                  {errors.decimals && <span className="text-red-500 text-sm">Required (0-9)</span>}
                </div>
                
                <div className="form-group">
                  <label className="block mb-1">Initial Supply</label>
                  <input 
                    type="number"
                    {...register('initialSupply', { required: true, min: 1 })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                    placeholder="1000000"
                  />
                  {errors.initialSupply && <span className="text-red-500 text-sm">Required (min 1)</span>}
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="block mb-1">Description</label>
                <textarea 
                  {...register('description')}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  rows={3}
                  placeholder="Describe your token and its purpose"
                ></textarea>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" className="btn-secondary" onClick={() => setCurrentStep(1)}>
                  Back
                </button>
                <button type="button" className="btn-primary" onClick={() => setCurrentStep(3)}>
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Review & Deploy</h2>
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <p className="text-lg mb-4">Almost there! Review your token settings before deploying.</p>
              <p>We will help you:</p>
              <ul className="list-disc list-inside my-4">
                <li>Deploy your SPL token contract to Solana</li>
                <li>Create immediate liquidity on Pump.fun</li>
                <li>Provide developer verification</li>
                <li>Set up analytics dashboard for your token</li>
              </ul>
              <p className="bg-yellow-800 p-3 rounded-md text-yellow-200 my-4">
                <strong>Important:</strong> This action will require a small SOL payment for transaction fees.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
                Back
              </button>
              <button className="btn-primary" onClick={handleSubmit(onSubmit)}>
                Deploy Token
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>© 2023 DevLaunch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 