import React, { forwardRef } from 'react';
import { useForm } from '../FormProvider';
import FormInput, { FormInputProps } from './FormInput';

interface FormFieldProps extends Omit<FormInputProps, 'error'> {
  name: string;
  validate?: (value: string) => string | undefined;
}

/**
 * FormField component that integrates with FormProvider
 * Automatically handles form errors and validation
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, validate, onBlur, onChange, ...props }, ref) => {
    // Get form context
    const { errors, setFieldError, clearFieldError } = useForm();
    
    // Handle blur event for validation
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Run validation if provided
      if (validate) {
        const error = validate(value);
        if (error) {
          setFieldError(name, error);
        } else {
          clearFieldError(name);
        }
      }
      
      // Call original onBlur if provided
      if (onBlur) {
        onBlur(e);
      }
    };
    
    // Handle change event
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Clear error when user starts typing
      clearFieldError(name);
      
      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };
    
    return (
      <FormInput
        ref={ref}
        id={name}
        name={name}
        error={errors[name]}
        onBlur={handleBlur}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

FormField.displayName = 'FormField';

export default FormField; 