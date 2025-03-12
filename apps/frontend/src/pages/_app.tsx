import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import WalletContextProvider from '../components/wallet/WalletContextProvider';
import Meta from '../components/Meta';
import { useRouter } from 'next/router';
import { authService } from '../services/api';
import { ROUTES } from '../constants/routes';
import { I18nProvider } from '../components/I18nProvider';
import ErrorBoundary from '../components/ErrorBoundary';
import NotificationProvider from '../components/NotificationProvider';

// Routes that require authentication
const AUTH_REQUIRED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.TRANSFERS,
  ROUTES.TRANSACTIONS,
  ROUTES.CREATE_TOKEN,
  '/profile', // Profile page
  '/settings' // Settings page
];

function MyApp({ Component, pageProps }: AppProps) {
  // For SSR, only render after client-side hydration is complete
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check route access permissions
  useEffect(() => {
    // Check if current path requires authentication
    const checkAuth = () => {
      const pathname = router.pathname;
      
      // Check if this is a protected route
      const requiresAuth = AUTH_REQUIRED_ROUTES.some(route => {
        if (typeof route === 'string') {
          return pathname === route || pathname.startsWith(`${route}/`);
        }
        return false;
      });
      
      // If authentication is required but not logged in, redirect to login page
      if (requiresAuth && !authService.isAuthenticated()) {
        router.push(`${ROUTES.LOGIN}?redirect=${pathname}`);
      }
    };
    
    if (mounted) {
      checkAuth();
    }
  }, [router.pathname, mounted]);

  return (
    <ErrorBoundary>
      <I18nProvider defaultLocale="en">
        <NotificationProvider>
          <Meta 
            title="Launch your token on Solana with ease"
            description="DevLaunch makes it easy to create, manage and transfer tokens on the Solana blockchain."
          />
          
          <ThemeProvider>
            <WalletContextProvider>
              {mounted && <Component {...pageProps} />}
            </WalletContextProvider>
          </ThemeProvider>
        </NotificationProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default MyApp; 