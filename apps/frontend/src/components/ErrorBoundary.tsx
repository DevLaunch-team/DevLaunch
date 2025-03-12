import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Error reporting service for production environment
const reportError = (error: Error, errorInfo: ErrorInfo) => {
  // Can integrate error reporting services like Sentry here
  console.error('ErrorBoundary caught an error:', error, errorInfo);
};

// Fallback UI component for errors
const DefaultFallback: React.FC<{ error: Error | null; resetError: () => void }> = ({ error, resetError }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-300" />
          </div>
        </div>
        
        <h1 className="mt-5 text-center text-xl font-semibold text-gray-900 dark:text-white">
          {t('error.componentError') || 'Component Error'}
        </h1>
        
        <div className="mt-3">
          <p className="text-center text-gray-600 dark:text-gray-300">
            {t('error.somethingWentWrong') || 'Something went wrong. Please try again.'}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded text-sm text-red-800 dark:text-red-300 font-mono overflow-auto max-h-40">
              {error.toString()}
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <button
            onClick={resetError}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('error.tryAgain') || 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Global error boundary component to catch JavaScript errors in child components
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error information
    this.setState({ errorInfo });
    reportError(error, errorInfo);
  }
  
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Show custom fallback UI or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return <DefaultFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 