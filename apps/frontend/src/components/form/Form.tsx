import React, { FormEvent, ReactNode } from 'react';
import { ValidationSchema, useFormValidation, useTranslation } from '../../hooks';
import LoadingButton from '../ui/LoadingButton';

interface FormProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  validationSchema?: ValidationSchema;
  defaultValues?: Record<string, any>;
  children: ((methods: {
    register: (name: string) => {
      name: string;
      value: any;
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
      onBlur: () => void;
    };
    formState: {
      errors: Record<string, string>;
      isSubmitting: boolean;
    };
    setValue: (name: string, value: any) => void;
    getValue: (name: string) => any;
    clearError: (name: string) => void;
  }) => ReactNode) | ReactNode;
  submitLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}

/**
 * Generic form component that handles form state, validation, and submission
 */
const Form: React.FC<FormProps> = ({
  onSubmit,
  validationSchema = {},
  defaultValues = {},
  children,
  submitLabel,
  resetLabel,
  showReset = false,
  isLoading = false,
  disabled = false,
  className = '',
  buttonClassName = '',
}) => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = React.useState<Record<string, any>>(defaultValues);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { errors, validateForm, validateAndUpdateField, clearError } = useFormValidation(validationSchema);

  // Reset form to default values
  const resetForm = () => {
    setFormValues(defaultValues);
  };

  // Get form field value
  const getValue = (name: string) => formValues[name];

  // Set form field value
  const setValue = (name: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate props for form fields
  const register = (name: string) => {
    return {
      name,
      value: formValues[name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setFormValues(prev => ({
          ...prev,
          [name]: value
        }));
      },
      onBlur: () => {
        if (validationSchema[name]) {
          validateAndUpdateField(name, formValues[name], formValues);
        }
      }
    };
  };

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate the form
    const isValid = validateForm(formValues);
    if (!isValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render children with form methods
  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({
        register,
        formState: {
          errors,
          isSubmitting: isSubmitting || isLoading
        },
        setValue,
        getValue,
        clearError
      });
    }
    
    return children;
  };
  
  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {renderChildren()}
      
      <div className="flex justify-end mt-6 space-x-4">
        {showReset && (
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            disabled={isSubmitting || isLoading || disabled}
          >
            {resetLabel || t('form.reset')}
          </button>
        )}
        
        <LoadingButton
          type="submit"
          isLoading={isSubmitting || isLoading}
          disabled={disabled}
          className={buttonClassName}
        >
          {submitLabel || t('form.submit')}
        </LoadingButton>
      </div>
    </form>
  );
};

export default Form; 