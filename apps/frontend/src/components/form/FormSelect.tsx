import React, { forwardRef } from 'react';
import { ExclamationCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '../../utils/i18n';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  label?: string;
  error?: string;
  helpText?: string;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
  helpTextClassName?: string;
  options: SelectOption[] | string[];
  showErrorIcon?: boolean;
  emptyOptionLabel?: string;
  showEmptyOption?: boolean;
  name: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Generic form select component with support for label, error message, and help text
 */
const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(({
  label,
  error,
  helpText,
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  errorClassName = '',
  helpTextClassName = '',
  showErrorIcon = true,
  options,
  required = false,
  optional = false,
  placeholder,
  size = 'md',
  name,
  id,
  ...rest
}, ref) => {
  const { t } = useTranslation();
  const selectId = id || name;
  const hasError = !!error;
  
  // Default empty option label from translations
  const defaultEmptyOptionLabel = t('form.selectPlaceholder') || 'Please select...';
  
  // Base class name
  const baseSelectClassName = 'block w-full pr-10 pl-4 py-2 rounded-md focus:outline-none focus:ring-2 border appearance-none';
  
  // Error state class name
  const errorStateClassName = hasError
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white';
  
  // Disabled state class name
  const disabledStateClassName = disabled
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
    : '';
  
  // Complete select class name
  const fullSelectClassName = `${baseSelectClassName} ${errorStateClassName} ${disabledStateClassName} ${selectClassName}`;
  
  // Process options, convert string array to SelectOption array
  const normalizedOptions: SelectOption[] = options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : undefined}
          className={fullSelectClassName}
          {...rest}
        >
          {showEmptyOption && (
            <option value="">{emptyOptionLabel || defaultEmptyOptionLabel}</option>
          )}
          
          {normalizedOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {hasError && showErrorIcon ? (
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          )}
        </div>
      </div>
      
      {hasError && (
        <p
          id={`${selectId}-error`}
          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${errorClassName}`}
        >
          {error}
        </p>
      )}
      
      {helpText && !hasError && (
        <p
          id={`${selectId}-description`}
          className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${helpTextClassName}`}
        >
          {helpText}
        </p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect; 