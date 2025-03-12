import React, { Fragment, ReactNode, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../utils/i18n';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  hideCloseIcon?: boolean;
  closeButtonText?: string;
  submitButtonText?: string;
  onSubmit?: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  maxHeight?: boolean;
  testId?: string;
}

/**
 * Modal component using Headless UI
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = false,
  hideCloseIcon = false,
  closeButtonText,
  submitButtonText,
  onSubmit,
  isLoading = false,
  variant = 'default',
  maxHeight = false,
  testId,
}) => {
  const { t } = useTranslation();
  const initialFocusRef = useRef(null);

  // Size classes
  const sizeClasses = {
    xs: 'sm:max-w-xs',
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'sm:max-w-4xl',
  };

  // Variant classes for the header and footer backgrounds
  const variantClasses = {
    default: {
      header: 'bg-white dark:bg-gray-800',
      footer: 'bg-gray-50 dark:bg-gray-700',
    },
    danger: {
      header: 'bg-red-50 dark:bg-red-900/20',
      footer: 'bg-red-50 dark:bg-red-900/30',
    },
    warning: {
      header: 'bg-yellow-50 dark:bg-yellow-900/20',
      footer: 'bg-yellow-50 dark:bg-yellow-900/30',
    },
    success: {
      header: 'bg-green-50 dark:bg-green-900/20',
      footer: 'bg-green-50 dark:bg-green-900/30',
    },
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={initialFocusRef}
        onClose={closeOnClickOutside ? onClose : () => {}}
        data-testid={testId}
      >
        {/* Background overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all`}
              >
                {/* Header */}
                {title && (
                  <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${variantClasses[variant].header}`}>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      ref={initialFocusRef}
                    >
                      {title}
                    </Dialog.Title>
                    {!hideCloseIcon && (
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                        onClick={onClose}
                      >
                        <span className="sr-only">{t('common.close')}</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className={`px-6 py-4 ${maxHeight ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
                  {children}
                </div>

                {/* Footer */}
                {(footer || showCloseButton || onSubmit) && (
                  <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 ${variantClasses[variant].footer}`}>
                    {footer || (
                      <>
                        {showCloseButton && (
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            onClick={onClose}
                            disabled={isLoading}
                          >
                            {closeButtonText || t('common.cancel')}
                          </button>
                        )}
                        {onSubmit && (
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            onClick={onSubmit}
                            disabled={isLoading}
                          >
                            {isLoading && (
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
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
                            )}
                            {submitButtonText || t('common.submit')}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal; 