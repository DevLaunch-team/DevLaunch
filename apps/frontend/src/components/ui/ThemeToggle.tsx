import React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  mode?: 'icon' | 'button' | 'switch';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  mode = 'icon'
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  const isDark = theme === 'dark';
  
  // Size classes
  const sizeClasses = {
    sm: {
      button: 'h-8 px-2 text-xs',
      icon: 'h-4 w-4',
      switch: 'h-6 w-11'
    },
    md: {
      button: 'h-10 px-3 text-sm',
      icon: 'h-5 w-5',
      switch: 'h-7 w-14'
    },
    lg: {
      button: 'h-12 px-4 text-base',
      icon: 'h-6 w-6',
      switch: 'h-8 w-16'
    }
  };
  
  // Render as icon
  if (mode === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800 ${className}`}
        aria-label={isDark ? t('common.switchToLightMode') : t('common.switchToDarkMode')}
        title={isDark ? t('common.switchToLightMode') : t('common.switchToDarkMode')}
      >
        {isDark ? (
          <SunIcon className={sizeClasses[size].icon} />
        ) : (
          <MoonIcon className={sizeClasses[size].icon} />
        )}
      </button>
    );
  }
  
  // Render as button
  if (mode === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white ${sizeClasses[size].button} font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ${className}`}
      >
        {isDark ? (
          <>
            <SunIcon className={sizeClasses[size].icon} />
            <span>{t('common.lightMode')}</span>
          </>
        ) : (
          <>
            <MoonIcon className={sizeClasses[size].icon} />
            <span>{t('common.darkMode')}</span>
          </>
        )}
      </button>
    );
  }
  
  // Render as switch
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${isDark ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex ${sizeClasses[size].switch} flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className}`}
      role="switch"
      aria-checked={isDark ? 'true' : 'false'}
      aria-label={isDark ? t('common.switchToLightMode') : t('common.switchToDarkMode')}
    >
      <span className="sr-only">
        {isDark ? t('common.switchToLightMode') : t('common.switchToDarkMode')}
      </span>
      <span
        aria-hidden="true"
        className={`${
          isDark ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      >
        {isDark ? (
          <SunIcon className="h-3 w-3 text-indigo-600" />
        ) : (
          <MoonIcon className="h-3 w-3 text-gray-400" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle; 