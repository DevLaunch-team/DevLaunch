import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTranslation } from '../utils/i18n';
import { getFieldError } from '../utils/errorHandler';
import { ApiError } from '../services/api';
import AlertMessage from './ui/AlertMessage';

// Form context type
interface FormContextType {
  errors: Record<string, string>;
  formError: string | null;
  formSuccess: string | null;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  setFormError: (message: string | null) => void;
  setFormSuccess: (message: string | null) => void;
  clearAllErrors: () => void;
  handleApiError: (error: unknown) => void;
}

// Create context with default values
const FormContext = createContext<FormContextType>({
  errors: {},
  formError: null,
  formSuccess: null,
  setFieldError: () => {},
  clearFieldError: () => {},
  setFormError: () => {},
  setFormSuccess: () => {},
  clearAllErrors: () => {},
  handleApiError: () => {},
});

// Hook to use form context
export const useForm = () => useContext(FormContext);

interface FormProviderProps {
  children: ReactNode;
  initialErrors?: Record<string, string>;
  initialFormError?: string | null;
  initialFormSuccess?: string | null;
}

// Form Provider component
export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  initialErrors = {},
  initialFormError = null,
  initialFormSuccess = null,
}) => {
  // Translation
  const { t } = useTranslation();
  
  // State
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);
  const [formError, setFormError] = useState<string | null>(initialFormError);
  const [formSuccess, setFormSuccess] = useState<string | null>(initialFormSuccess);
  
  // Set field error
  const setFieldError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };
  
  // Clear field error
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  
  // Clear all errors
  const clearAllErrors = () => {
    setErrors({});
    setFormError(null);
  };
  
  // Handle API errors
  const handleApiError = (error: unknown) => {
    // Clear previous errors
    clearAllErrors();
    
    if (error && typeof error === 'object' && 'isApiError' in error) {
      const apiError = error as ApiError;
      
      // Set form-level error
      setFormError(apiError.message);
      
      // Set field-level errors if there are validation errors
      if (apiError.validationErrors) {
        const newErrors: Record<string, string> = {};
        
        Object.entries(apiError.validationErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            newErrors[field] = messages[0];
          }
        });
        
        setErrors(newErrors);
      }
    } else if (error instanceof Error) {
      setFormError(error.message);
    } else {
      setFormError(t('error.unexpectedError'));
    }
  };
  
  // Context value
  const value: FormContextType = {
    errors,
    formError,
    formSuccess,
    setFieldError,
    clearFieldError,
    setFormError,
    setFormSuccess,
    clearAllErrors,
    handleApiError,
  };
  
  return (
    <FormContext.Provider value={value}>
      {formError && (
        <div className="mb-4">
          <AlertMessage
            type="error"
            message={formError}
            onClose={() => setFormError(null)}
          />
        </div>
      )}
      
      {formSuccess && (
        <div className="mb-4">
          <AlertMessage
            type="success"
            message={formSuccess}
            onClose={() => setFormSuccess(null)}
          />
        </div>
      )}
      
      {children}
    </FormContext.Provider>
  );
};

export default FormProvider; 