import React, { ReactNode, useEffect, useState } from 'react';
import { I18nContext, createTranslator, loadTranslations } from '../utils/i18n';

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: string;
}

/**
 * I18n Provider Component
 * Provides translation functionality to all children components
 */
export function I18nProvider({ children, defaultLocale = 'en' }: I18nProviderProps) {
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [locale, setLocale] = useState(defaultLocale);
  
  // Translation function using current translations
  const t = createTranslator(translations);
  
  // Initialize with user's preferred locale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale');
      const browserLocale = navigator.language.split('-')[0];
      const initialLocale = savedLocale || browserLocale || defaultLocale;
      
      setLocale(initialLocale);
      
      if (!savedLocale) {
        localStorage.setItem('locale', initialLocale);
      }
    }
  }, [defaultLocale]);
  
  // Load translations whenever locale changes
  useEffect(() => {
    const fetchTranslations = async () => {
      const loadedTranslations = await loadTranslations(locale);
      setTranslations(loadedTranslations);
    };
    
    fetchTranslations();
  }, [locale]);
  
  // Change locale function
  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };
  
  return (
    <I18nContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
} 