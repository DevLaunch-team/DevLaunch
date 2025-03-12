import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertMessageProps {
  type: AlertType;
  title?: string;
  message: string | React.ReactNode;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  dismissible?: boolean;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
  showIcon = true,
  dismissible = true,
}) => {
  // Configure styles for different alert types
  const config = {
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-300',
      borderColor: 'border-green-400 dark:border-green-800',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400 dark:text-green-500" />,
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-300',
      borderColor: 'border-red-400 dark:border-red-800',
      icon: <XCircleIcon className="h-5 w-5 text-red-400 dark:text-red-500" />,
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-300',
      borderColor: 'border-yellow-400 dark:border-yellow-800',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />,
    },
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-300',
      borderColor: 'border-blue-400 dark:border-blue-800',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400 dark:text-blue-500" />,
    },
  };
  
  const selectedConfig = config[type];
  
  return (
    <div className={`rounded-md p-4 border-l-4 ${selectedConfig.bgColor} ${selectedConfig.borderColor} ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {selectedConfig.icon}
          </div>
        )}
        <div className={`ml-3 ${showIcon ? '' : 'ml-0'} flex-grow`}>
          {title && (
            <h3 className={`text-sm font-medium ${selectedConfig.textColor}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${selectedConfig.textColor} ${title ? 'mt-2' : ''}`}>
            {message}
          </div>
        </div>
        {dismissible && onClose && (
          <div className="flex-shrink-0 self-start ml-auto pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedConfig.textColor}`}
              onClick={onClose}
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertMessage; 