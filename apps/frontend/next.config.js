/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure internationalization
  i18n: {
    // List of supported locales
    locales: ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'ru'],
    // Default locale
    defaultLocale: 'en',
    // Automatic locale detection
    localeDetection: true,
  },
  
  // Environment variables available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    NEXT_PUBLIC_SOLANA_RPC: process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com',
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
  },
  
  // Configure image domains for next/image
  images: {
    domains: ['solana.com', 'arweave.net', 'www.arweave.net'],
  },
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add polyfills for crypto and stream in client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
    }
    
    return config;
  },
};

module.exports = nextConfig; 