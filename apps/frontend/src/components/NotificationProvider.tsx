import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {}
});

export const useNotification = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children,
  position = 'top-right',
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Add a new notification
  const addNotification = useCallback((message: string, type: NotificationType, duration = 5000) => {
    const id = Date.now().toString();
    
    setNotifications(prev => {
      // Limit the number of displayed notifications
      const filtered = prev.length >= maxNotifications 
        ? prev.slice(0, maxNotifications - 1) 
        : prev;
      
      return [...filtered, { id, message, type, duration }];
    });
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [maxNotifications]);
  
  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };
  
  // Get icon based on notification type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
      default:
        return null;
    }
  };
  
  // Get background color based on notification type
  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
    }
  };
  
  // Get text color based on notification type
  const getTextColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-300';
      case 'error':
        return 'text-red-800 dark:text-red-300';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-300';
      case 'info':
        return 'text-blue-800 dark:text-blue-300';
      default:
        return 'text-gray-800 dark:text-gray-300';
    }
  };
  
  // Context value
  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {/* Notification container */}
      <div className={`fixed z-50 flex flex-col gap-2 max-w-md w-full ${getPositionStyles()}`}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`rounded-md p-4 shadow-lg border ${getBackgroundColor(notification.type)} transform transition-all duration-300 ease-in-out`}
            style={{ maxWidth: '24rem' }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className={`ml-3 flex-1 ${getTextColor(notification.type)}`}>
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => removeNotification(notification.id)}
                    className={`inline-flex rounded-md p-1.5 ${getTextColor(notification.type)} hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {children}
    </NotificationContext.Provider>
  );
};

// Shorthand hooks for common notification types
export const useSuccessNotification = () => {
  const { addNotification } = useNotification();
  return useCallback((message: string, duration?: number) => 
    addNotification(message, 'success', duration), [addNotification]);
};

export const useErrorNotification = () => {
  const { addNotification } = useNotification();
  return useCallback((message: string, duration?: number) => 
    addNotification(message, 'error', duration), [addNotification]);
};

export const useWarningNotification = () => {
  const { addNotification } = useNotification();
  return useCallback((message: string, duration?: number) => 
    addNotification(message, 'warning', duration), [addNotification]);
};

export const useInfoNotification = () => {
  const { addNotification } = useNotification();
  return useCallback((message: string, duration?: number) => 
    addNotification(message, 'info', duration), [addNotification]);
};

export default NotificationProvider; 