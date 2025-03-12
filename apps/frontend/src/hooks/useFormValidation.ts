import { useState, useCallback } from 'react';
import { useTranslation } from '../utils/i18n';

// Error types
export type ValidationError = string | null;
export type FormErrors<T> = Partial<Record<keyof T, ValidationError>>;

// Validator function type
export type Validator<T> = (value: any, formData: T) => ValidationError;

/**
 * Creates a set of validation rules for form fields
 */
export const createValidators = <T extends Record<string, any>>(
  config: Record<keyof T, Validator<T>[]>
) => config;

/**
 * Custom hook for form validation
 * @param initialData - Initial form data
 * @param validators - Validation rules for form fields
 * @returns Form state, errors, validation functions and handlers
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  validators: Record<keyof T, Validator<T>[]> = {} as Record<keyof T, Validator<T>[]>
) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: any): ValidationError => {
      const fieldValidators = validators[name] || [];
      
      for (const validator of fieldValidators) {
        const error = validator(value, formData);
        if (error) return error;
      }
      
      return null;
    },
    [formData, validators]
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      // Handle different input types
      const fieldValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value;
      
      setFormData(prev => ({
        ...prev,
        [name]: fieldValue,
      }));
      
      // Mark field as touched
      if (!touched[name as keyof T]) {
        setTouched(prev => ({
          ...prev,
          [name]: true,
        }));
      }
      
      // Validate on change if touched
      const error = validateField(name as keyof T, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField, touched]
  );

  // Handle blur event
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      
      // Mark as touched
      setTouched(prev => ({
        ...prev,
        [name]: true,
      }));
      
      // Validate on blur
      const error = validateField(name as keyof T, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField]
  );

  // Set a form value programmatically
  const setFieldValue = useCallback(
    (name: keyof T, value: any, validate = true) => {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      if (validate) {
        const error = validateField(name, value);
        setErrors(prev => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateField]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;
    
    // Touch all fields
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);
    
    // Validate each field
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, formData[fieldName]);
      
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialData]);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0,
  };
};

/**
 * Common validators
 */
export const validators = {
  required: <T extends Record<string, any>>(fieldName?: string) =>
    ((value: any): ValidationError => {
      if (value === undefined || value === null || value === '') {
        return fieldName ? `${fieldName} is required` : 'This field is required';
      }
      return null;
    }) as Validator<T>,
    
  email: <T extends Record<string, any>>() =>
    ((value: string): ValidationError => {
      if (!value) return null;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email address';
      }
      return null;
    }) as Validator<T>,
    
  minLength: <T extends Record<string, any>>(min: number) =>
    ((value: string): ValidationError => {
      if (!value) return null;
      
      if (value.length < min) {
        return `Minimum length is ${min} characters`;
      }
      return null;
    }) as Validator<T>,
    
  maxLength: <T extends Record<string, any>>(max: number) =>
    ((value: string): ValidationError => {
      if (!value) return null;
      
      if (value.length > max) {
        return `Maximum length is ${max} characters`;
      }
      return null;
    }) as Validator<T>,
    
  matches: <T extends Record<string, any>>(pattern: RegExp, message: string) =>
    ((value: string): ValidationError => {
      if (!value) return null;
      
      if (!pattern.test(value)) {
        return message;
      }
      return null;
    }) as Validator<T>,
    
  passwordMatch: <T extends Record<string, any>>(matchField: keyof T) =>
    ((value: string, formData: T): ValidationError => {
      if (!value) return null;
      
      if (value !== formData[matchField]) {
        return 'Passwords do not match';
      }
      return null;
    }) as Validator<T>,
};

export default useFormValidation; 