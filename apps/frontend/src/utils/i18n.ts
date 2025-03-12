import { createContext, useContext } from 'react';

// Define types for translations
export interface Translations {
  [key: string]: string | Translations;
}

// Define translation function type
export type TFunction = (key: string, params?: Record<string, string | number>) => string;

// Define the context type
export interface I18nContextType {
  locale: string;
  t: TFunction;
  changeLocale: (locale: string) => void;
}

// Default implementation
const defaultTranslate = (key: string) => key;
const defaultChangeLocale = () => {};

// Create the context with default implementation
export const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: defaultTranslate,
  changeLocale: defaultChangeLocale
});

/**
 * Hook to use translations in components
 */
export function useTranslation(): I18nContextType {
  return useContext(I18nContext);
}

/**
 * Get translation function with loaded translations
 */
export function createTranslator(translations: Translations): TFunction {
  // Get nested translation value using dot notation
  const getNestedValue = (obj: Translations, path: string): string => {
    const keys = path.split('.');
    let current: any = obj;
    
    for (const key of keys) {
      if (current === undefined || current === null) return path;
      current = current[key];
    }
    
    return typeof current === 'string' ? current : path;
  };
  
  // Translation function with optional parameter substitution
  return function translate(key: string, params?: Record<string, string | number>): string {
    let value = getNestedValue(translations, key);
    
    // Fall back to key if translation not found
    if (value === key) {
      return key;
    }
    
    // Replace parameters in format {{paramName}}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(`{{${paramKey}}}`, String(paramValue));
      });
    }
    
    return value;
  };
}

/**
 * Load translations asynchronously
 */
export async function loadTranslations(locale: string): Promise<Translations> {
  try {
    // For better performance in production, consider using a more efficient approach
    // such as importing translations at build time or using a CDN
    const translations = await import(`../locales/${locale}.json`);
    return translations.default || {};
  } catch (error) {
    console.error(`Failed to load translations for locale ${locale}:`, error);
    return {};
  }
} 