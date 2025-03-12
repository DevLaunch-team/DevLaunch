import React, { InputHTMLAttributes } from 'react';
import { useTranslation } from '../../hooks';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helpText?: string;
  containerClassName?: string;
}

/**
 * FormField component for text inputs with validation support
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  error,
  required = false,
  optional = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helpText,
  containerClassName = '',
  ...rest
}) => {
  const { t } = useTranslation();
  const inputId = `field-${name}`;
  
  const defaultInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const errorInputClasses = "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:text-red-400";
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {optional && !required && (
            <span className="text-gray-400 text-xs ml-1">
              ({t('form.optional')})
            </span>
          )}
        </label>
      )}
      
      <input
        id={inputId}
        name={name}
        className={`${defaultInputClasses} ${error ? errorInputClasses : ''} ${inputClassName}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
        {...rest}
      />
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
      
      {error && (
        <p 
          id={`${name}-error`}
          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${errorClassName}`}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField; 