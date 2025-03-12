import React from 'react';
import Link from 'next/link';
import Meta from '../components/Meta';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../utils/i18n';

// Create custom icon
const LockIcon: React.FC = () => {
  return (
    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900">
      <ShieldExclamationIcon className="h-12 w-12 text-red-600 dark:text-red-300" />
    </div>
  );
};

const UnauthorizedPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Meta 
        title={t('page.unauthorized')} 
        description={t('page.unauthorizedDescription')}
        noIndex={true}
      />
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-md sm:rounded-lg sm:px-10 text-center">
          <LockIcon />
          
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('page.unauthorized')}
          </h1>
          
          <p className="mt-2 text-center text-md text-gray-600 dark:text-gray-400">
            {t('page.noAccessPermission')}
          </p>
          
          <div className="mt-6 flex flex-col space-y-4">
            <Link href={ROUTES.LOGIN}>
              <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('auth.login')}
              </button>
            </Link>
            
            <Link href={ROUTES.HOME}>
              <button className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('page.goHome')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 