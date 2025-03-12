import { useState, useCallback } from 'react';
import { useTranslation } from '../utils/i18n';

// Validation rule type
export type ValidationRule<T> = {
  validate: (value: any, formValues: T) => boolean;
  message: string | ((params: any) => string);
  params?: any;
};

// Form field configuration
export type FieldConfig<T> = {
  initialValue: any;
  validationRules?: ValidationRule<T>[];
};

// Form configuration type
export type FormConfig<T> = {
  [K in keyof T]: FieldConfig<T>;
};

// Form errors type
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Custom form handling hook with validation and error management
 * @param config Form configuration object
 * @param onSubmit Submit callback function
 * @returns Form state and methods
 */
export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>,
  onSubmit?: (values: T) => void | Promise<void>
) {
  const { t } = useTranslation();
  
  // Extract initial values from config
  const initialValues = Object.entries(config).reduce((acc, [key, fieldConfig]) => {
    acc[key as keyof T] = fieldConfig.initialValue;
    return acc;
  }, {} as T);
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle field value changes
  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field on each change if it's been touched
    if (touched[field]) {
      validateField(field, value);
    }
  }, [touched]);
  
  // Handle field blur events
  const handleBlur = useCallback((field: keyof T) => {
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, values[field]);
    }
  }, [values, touched]);
  
  // Validate a single field
  const validateField = useCallback((field: keyof T, value: any) => {
    const fieldConfig = config[field];
    if (!fieldConfig.validationRules) return;
    
    for (const rule of fieldConfig.validationRules) {
      if (!rule.validate(value, values)) {
        const message = typeof rule.message === 'function' 
          ? rule.message(rule.params)
          : rule.message;
        
        setErrors(prev => ({ ...prev, [field]: message }));
        return;
      }
    }
    
    // Validation passed, clear the error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, [values, config]);
  
  // Validate all form fields
  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors: FormErrors<T> = {};
    const newTouched: Record<keyof T, boolean> = { ...touched };
    
    // Validate each field
    Object.entries(config).forEach(([key, fieldConfig]) => {
      const field = key as keyof T;
      newTouched[field] = true;
      
      if (fieldConfig.validationRules) {
        for (const rule of fieldConfig.validationRules) {
          if (!rule.validate(values[field], values)) {
            const message = typeof rule.message === 'function' 
              ? rule.message(rule.params)
              : rule.message;
            
            newErrors[field] = message;
            isValid = false;
            break;
          }
        }
      }
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  }, [values, config, touched]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
    return isValid;
  }, [values, validateForm, onSubmit]);
  
  // Reset the form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);
  
  // Set a specific field value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Set a specific field error
  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors(prev => {
      if (error === undefined) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return { ...prev, [field]: error };
    });
  }, []);
  
  // Common validation rules
  const validationRules = {
    required: (message?: string): ValidationRule<T> => ({
      validate: (value) => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
      },
      message: message || t('error.required') || 'This field is required'
    }),
    email: (message?: string): ValidationRule<T> => ({
      validate: (value) => {
        if (!value) return true; // Skip email validation for empty values, should use required rule
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
      },
      message: message || t('error.invalidEmail') || 'Invalid email address'
    }),
    minLength: (length: number, message?: string): ValidationRule<T> => ({
      validate: (value) => {
        if (!value) return true;
        return value.length >= length;
      },
      message: message || (t('error.minLength', { 0: length }) || `Minimum length is ${length} characters`),
      params: { length }
    }),
    matchField: (field: keyof T, message?: string): ValidationRule<T> => ({
      validate: (value, formValues) => value === formValues[field],
      message: message || t('error.passwordMatch') || 'Fields do not match'
    }),
    pattern: (regex: RegExp, message: string): ValidationRule<T> => ({
      validate: (value) => {
        if (!value) return true;
        return regex.test(value);
      },
      message
    })
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldError,
    validationRules
  };
}

export default useForm; 