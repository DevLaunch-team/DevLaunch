import React, { forwardRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helpTextClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showErrorIcon?: boolean;
}

/**
 * 通用表单输入组件，支持标签、错误消息、帮助文本和图标
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  error,
  helpText,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helpTextClassName = '',
  leftIcon,
  rightIcon,
  showErrorIcon = true,
  type = 'text',
  required,
  disabled,
  id,
  name,
  placeholder,
  ...rest
}, ref) => {
  const inputId = id || name;
  const hasError = !!error;
  
  // 基础类名
  const baseInputClassName = 'block w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 border';
  
  // 错误状态类名
  const errorStateClassName = hasError
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white';
  
  // 禁用状态类名
  const disabledStateClassName = disabled
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
    : '';
  
  // 带图标的类名
  const withIconClassName = (leftIcon ? 'pl-10 ' : '') + (rightIcon || (hasError && showErrorIcon) ? 'pr-10 ' : '');
  
  // 完整的输入框类名
  const fullInputClassName = `${baseInputClassName} ${errorStateClassName} ${disabledStateClassName} ${withIconClassName} ${inputClassName}`;
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={fullInputClassName}
          {...rest}
        />
        
        {(rightIcon || (hasError && showErrorIcon)) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {hasError && showErrorIcon ? (
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
      
      {hasError && (
        <p
          id={`${inputId}-error`}
          className={`mt-1 text-sm text-red-600 dark:text-red-400 ${errorClassName}`}
        >
          {error}
        </p>
      )}
      
      {helpText && !hasError && (
        <p
          id={`${inputId}-description`}
          className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${helpTextClassName}`}
        >
          {helpText}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput; 