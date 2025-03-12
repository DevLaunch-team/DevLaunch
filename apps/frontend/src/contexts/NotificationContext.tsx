import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  autoDismiss?: boolean;
  dismissAfter?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  defaultDismissTime?: number;
}

/**
 * Provider component for the notification system
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  defaultDismissTime = 5000,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      autoDismiss: notification.autoDismiss !== false,
      dismissAfter: notification.dismissAfter || defaultDismissTime,
    };

    setNotifications(prevNotifications => {
      // If we've reached the max number of notifications, remove the oldest one
      const updatedNotifications = 
        prevNotifications.length >= maxNotifications
          ? prevNotifications.slice(1)
          : prevNotifications;
          
      return [...updatedNotifications, newNotification];
    });

    // Auto-dismiss if enabled
    if (newNotification.autoDismiss) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.dismissAfter);
    }

    return id;
  }, [maxNotifications, defaultDismissTime]);

  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook for accessing the notification context
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

/**
 * Notification UI component
 */
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  const { t } = useTranslation();

  // Get icon based on notification type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getBackgroundColor(notification.type)}
            border 
            ${notification.type === 'success' ? 'border-green-200 dark:border-green-800' : ''}
            ${notification.type === 'error' ? 'border-red-200 dark:border-red-800' : ''}
            ${notification.type === 'warning' ? 'border-yellow-200 dark:border-yellow-800' : ''}
            ${notification.type === 'info' ? 'border-blue-200 dark:border-blue-800' : ''}
            rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out
            transform translate-x-0 opacity-100
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">{notification.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => removeNotification(notification.id)}
              >
                <span className="sr-only">{t('common.close', 'Close')}</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContext; 