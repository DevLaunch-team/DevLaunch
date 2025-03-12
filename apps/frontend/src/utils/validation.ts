import { TFunction } from './i18n';

/**
 * Creates a required field validator
 * @param t Translation function
 * @param message Custom error message (optional)
 * @returns Validation function
 */
export const required = (t: TFunction, message?: string) => (value: string) => {
  if (!value || value.trim() === '') {
    return message || t('error.required');
  }
  return undefined;
};

/**
 * Creates a minimum length validator
 * @param t Translation function
 * @param length Minimum length required
 * @param message Custom error message (optional)
 * @returns Validation function
 */
export const minLength = (t: TFunction, length: number, message?: string) => (value: string) => {
  if (value && value.trim().length < length) {
    return message || t('error.minLength', { 0: String(length) });
  }
  return undefined;
};

/**
 * Creates a maximum length validator
 * @param t Translation function
 * @param length Maximum length allowed
 * @param message Custom error message (optional)
 * @returns Validation function
 */
export const maxLength = (t: TFunction, length: number, message?: string) => (value: string) => {
  if (value && value.trim().length > length) {
    return message || `Maximum length is ${length} characters`;
  }
  return undefined;
};

/**
 * Creates an email validator
 * @param t Translation function
 * @param message Custom error message (optional)
 * @returns Validation function
 */
export const email = (t: TFunction, message?: string) => (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !emailRegex.test(value)) {
    return message || t('error.invalidEmail');
  }
  return undefined;
};

/**
 * Creates a pattern validator
 * @param t Translation function
 * @param pattern Regular expression to test
 * @param message Error message
 * @returns Validation function
 */
export const pattern = (t: TFunction, pattern: RegExp, message: string) => (value: string) => {
  if (value && !pattern.test(value)) {
    return message;
  }
  return undefined;
};

/**
 * Creates a validator to check if a value matches another value
 * @param t Translation function
 * @param getValueToMatch Function to get the value to match against
 * @param message Custom error message (optional)
 * @returns Validation function
 */
export const matches = (
  t: TFunction, 
  getValueToMatch: () => string, 
  message?: string
) => (value: string) => {
  const valueToMatch = getValueToMatch();
  if (value !== valueToMatch) {
    return message || t('error.passwordMatch');
  }
  return undefined;
};

/**
 * Combines multiple validators
 * @param validators Array of validators to run
 * @returns Combined validation function that returns the first error found
 */
export const compose = (...validators: ((value: string) => string | undefined)[]) => (value: string) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return undefined;
};

export default {
  required,
  minLength,
  maxLength,
  email,
  pattern,
  matches,
  compose
}; 