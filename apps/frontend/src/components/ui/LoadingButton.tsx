import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../utils/i18n';

interface LoadingButtonProps {
  isLoading: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Generic loading button component that supports different variants and sizes
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  onClick,
  children,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loadingText,
  icon,
  className = '',
}) => {
  const { t } = useTranslation();
  
  // Get style classes based on variant
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent focus:ring-indigo-500';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-transparent focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent focus:ring-yellow-500';
      case 'outline':
        return 'bg-transparent hover:bg-gray-50 text-indigo-600 border-indigo-600 focus:ring-indigo-500 dark:hover:bg-gray-800 dark:text-indigo-400 dark:border-indigo-500';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent focus:ring-indigo-500';
    }
  };
  
  // Get style classes based on size
  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'py-1 px-3 text-xs';
      case 'md':
        return 'py-2 px-4 text-sm';
      case 'lg':
        return 'py-3 px-6 text-base';
      default:
        return 'py-2 px-4 text-sm';
    }
  };
  
  // Combine all class names
  const buttonClasses = `
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${fullWidth ? 'w-full' : ''}
    font-medium
    border
    rounded-md
    shadow-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors
    duration-200
    flex items-center justify-center
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
          {loadingText || t('common.loading') || 'Loading...'}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default LoadingButton; 