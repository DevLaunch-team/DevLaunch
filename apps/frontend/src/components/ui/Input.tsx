import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A styled input component with support for adornments and error states
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '',
    error,
    fullWidth = false,
    startAdornment,
    endAdornment,
    size = 'md',
    disabled,
    ...rest 
  }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: 'h-8 text-xs px-2',
      md: 'h-10 text-sm px-3',
      lg: 'h-12 text-base px-4'
    };
    
    // Base classes for the input container
    const containerClasses = `
      flex items-center
      bg-white dark:bg-gray-800
      border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
      ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-75' : ''}
      ${fullWidth ? 'w-full' : ''}
      rounded-md
      shadow-sm
      focus-within:ring-1 
      ${error 
        ? 'focus-within:ring-red-500 focus-within:border-red-500' 
        : 'focus-within:ring-indigo-500 focus-within:border-indigo-500 dark:focus-within:ring-indigo-400 dark:focus-within:border-indigo-400'
      }
      transition-colors
      ${className}
    `;
    
    // Base classes for the input element
    const inputClasses = `
      flex-grow
      bg-transparent
      border-none
      focus:outline-none
      focus:ring-0
      ${sizeClasses[size]}
      ${disabled ? 'cursor-not-allowed' : ''}
      text-gray-900 dark:text-white
      placeholder-gray-400 dark:placeholder-gray-500
    `;
    
    return (
      <div className={containerClasses}>
        {startAdornment && (
          <div className="pl-3 flex items-center text-gray-400">
            {startAdornment}
          </div>
        )}
        
        <input
          ref={ref}
          disabled={disabled}
          className={inputClasses}
          {...rest}
        />
        
        {endAdornment && (
          <div className="pr-3 flex items-center text-gray-400">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 