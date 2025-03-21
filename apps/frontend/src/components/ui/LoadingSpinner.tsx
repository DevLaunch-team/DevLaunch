import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'indigo' | 'gray';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'indigo',
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  // Color classes
  const colorClasses = {
    white: 'text-white',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    gray: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

// With message
interface LoadingSpinnerWithTextProps extends LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinnerWithText: React.FC<LoadingSpinnerWithTextProps> = ({
  size = 'md',
  color = 'indigo',
  className = '',
  message = 'Loading...'
}) => {
  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner size={size} color={color} className={className} />
      <span className={`ml-3 ${color === 'white' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
        {message}
      </span>
    </div>
  );
};

// Center in container
export const CenteredLoading: React.FC<LoadingSpinnerWithTextProps> = (props) => {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <LoadingSpinnerWithText {...props} />
    </div>
  );
};

export default LoadingSpinner; 