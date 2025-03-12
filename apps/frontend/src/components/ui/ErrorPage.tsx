import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../../utils/i18n';
import { 
  ExclamationTriangleIcon, 
  LockClosedIcon, 
  ServerIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export type ErrorType = 'notFound' | 'unauthorized' | 'serverError' | 'generic';

interface ErrorPageProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  description?: string;
  showHomeButton?: boolean;
}

/**
 * Generic error page component for displaying various page-level errors
 */
const ErrorPage: React.FC<ErrorPageProps> = ({ 
  type = 'generic', 
  title, 
  message, 
  description,
  showHomeButton = true 
}) => {
  const { t } = useTranslation();
  
  // Select icon based on error type
  const getIcon = () => {
    switch (type) {
      case 'notFound':
        return <QuestionMarkCircleIcon className="h-16 w-16 text-gray-400" aria-hidden="true" />;
      case 'unauthorized':
        return <LockClosedIcon className="h-16 w-16 text-yellow-500" aria-hidden="true" />;
      case 'serverError':
        return <ServerIcon className="h-16 w-16 text-red-500" aria-hidden="true" />;
      default:
        return <ExclamationTriangleIcon className="h-16 w-16 text-red-500" aria-hidden="true" />;
    }
  };
  
  // Get default title based on error type
  const getDefaultTitle = () => {
    switch (type) {
      case 'notFound':
        return t('page.notFound');
      case 'unauthorized':
        return t('page.unauthorized');
      case 'serverError':
        return t('page.serverError');
      default:
        return t('page.genericError');
    }
  };
  
  // Get default message based on error type
  const getDefaultMessage = () => {
    switch (type) {
      case 'notFound':
        return t('page.notFoundMessage');
      case 'unauthorized':
        return t('page.unauthorizedMessage');
      case 'serverError':
        return t('page.serverErrorMessage');
      default:
        return t('page.genericErrorMessage');
    }
  };
  
  // Get default description based on error type
  const getDefaultDescription = () => {
    switch (type) {
      case 'unauthorized':
        return t('page.unauthorizedDescription');
      case 'serverError':
        return t('page.serverErrorDescription');
      default:
        return '';
    }
  };
  
  // Use provided text or default text
  const displayTitle = title || getDefaultTitle();
  const displayMessage = message || getDefaultMessage();
  const displayDescription = description || getDefaultDescription();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 text-center">
          <div className="flex justify-center mb-6">
            {getIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {displayTitle}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {displayMessage}
          </p>
          
          {displayDescription && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {displayDescription}
            </p>
          )}
          
          {showHomeButton && (
            <div className="mt-6">
              <Link href="/">
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('page.goHome')}
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 