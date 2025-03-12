import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import Meta from '../components/Meta';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '../constants/routes';
import { useTranslation } from '../utils/i18n';

interface ErrorProps {
  statusCode?: number;
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
  const { t } = useTranslation();
  
  // Select different title and message based on status code
  const getErrorInfo = () => {
    if (statusCode === 404) {
      return {
        title: t('page.notFound'),
        message: t('page.notFoundMessage'),
      };
    } else if (statusCode === 403) {
      return {
        title: t('page.unauthorized'),
        message: t('page.unauthorizedMessage'),
      };
    } else if (statusCode === 500) {
      return {
        title: t('page.serverError'),
        message: t('page.serverErrorMessage'),
      };
    } else {
      return {
        title: t('page.genericError'),
        message: t('page.genericErrorMessage'),
      };
    }
  };
  
  const { title, message } = getErrorInfo();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Meta 
        title={title}
        description={message}
        noIndex={true}
      />
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-md sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 dark:bg-yellow-900">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600 dark:text-yellow-300" />
          </div>
          
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {title}
            {statusCode && <span className="ml-2 text-gray-500">({statusCode})</span>}
          </h1>
          
          <p className="mt-2 text-center text-md text-gray-600 dark:text-gray-400">
            {message}
          </p>
          
          <div className="mt-6 flex flex-col space-y-4">
            <Link href={ROUTES.HOME}>
              <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('page.goHome')}
              </button>
            </Link>
            
            <Link href={ROUTES.CONTACT}>
              <button className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('common.contactUs')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage; 