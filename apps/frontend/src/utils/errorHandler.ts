import { ApiError, ErrorType } from '../services/api';
import { TFunction } from './i18n';

/**
 * Get a translated error message based on the API error
 * @param error The API error object
 * @param t Translation function
 * @returns Translated error message
 */
export const getErrorMessage = (error: unknown, t: TFunction): string => {
  // Check if it's an API error
  if (error && typeof error === 'object' && 'isApiError' in error && error.isApiError) {
    const apiError = error as ApiError;
    
    // Return message based on error type
    switch (apiError.type) {
      case ErrorType.AUTHENTICATION:
        return t('error.authRequired');
      
      case ErrorType.FORBIDDEN:
        return t('error.permissionDenied');
      
      case ErrorType.NETWORK:
        return t('error.networkError');
      
      case ErrorType.SERVER:
        return t('error.serverError');
      
      case ErrorType.TIMEOUT:
        return t('error.timeout');
      
      case ErrorType.VALIDATION:
        return t('error.invalidInput');
      
      case ErrorType.UNKNOWN:
      default:
        return apiError.message || t('error.unexpectedError');
    }
  }
  
  // Handle regular errors
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle other types
  if (typeof error === 'string') {
    return error;
  }
  
  // Default error message
  return t('error.unexpectedError');
};

/**
 * Get validation error message for a specific field
 * @param error The API error object
 * @param field The form field name
 * @param t Translation function
 * @returns Field-specific error message or undefined if none exists
 */
export const getFieldError = (
  error: unknown,
  field: string,
  t: TFunction
): string | undefined => {
  // Check if it's an API error with validation errors
  if (
    error &&
    typeof error === 'object' &&
    'isApiError' in error &&
    error.isApiError &&
    error.type === ErrorType.VALIDATION &&
    error.validationErrors &&
    error.validationErrors[field] &&
    error.validationErrors[field].length > 0
  ) {
    // Return the first error message for the field
    return error.validationErrors[field][0];
  }
  
  return undefined;
};

/**
 * Display error notification using provided showNotification function
 * @param error The error object
 * @param t Translation function
 * @param showNotification Function to display notifications
 */
export const handleErrorNotification = (
  error: unknown,
  t: TFunction,
  showNotification: (message: string, type: 'error' | 'success' | 'warning' | 'info') => void
): void => {
  const message = getErrorMessage(error, t);
  showNotification(message, 'error');
};

export default {
  getErrorMessage,
  getFieldError,
  handleErrorNotification
}; 