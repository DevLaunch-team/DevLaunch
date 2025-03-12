import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  className = '',
  buttonSize = 'md'
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Size configurations
  const sizeClasses = {
    sm: 'p-1.5 rounded-md',
    md: 'p-2 rounded-lg',
    lg: 'p-2.5 rounded-lg'
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[buttonSize]}
        transition-colors 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        border border-gray-300 dark:border-gray-600 
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-300 
        hover:bg-gray-50 dark:hover:bg-gray-700
        ${className}
      `}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <SunIcon className={iconSizes[buttonSize]} />
      ) : (
        <MoonIcon className={iconSizes[buttonSize]} />
      )}
    </button>
  );
};

export default ThemeSwitcher; 