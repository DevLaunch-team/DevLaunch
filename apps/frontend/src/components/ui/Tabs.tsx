import React, { useState, ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string | ReactNode;
  icon?: ReactNode;
  content: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underlined' | 'bordered' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  tabsClassName?: string;
  panelClassName?: string;
  orientation?: 'horizontal' | 'vertical';
  testId?: string;
}

/**
 * Tabs component for switching between different content views
 */
const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTabId,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
  tabsClassName = '',
  panelClassName = '',
  orientation = 'horizontal',
  testId,
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };
  
  // Active tab data
  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  // Get tab button classes based on variant
  const getTabButtonClasses = (tab: TabItem) => {
    const isActive = tab.id === activeTab;
    const isDisabled = tab.disabled;
    
    const baseClasses = `
      ${sizeClasses[size]}
      ${fullWidth ? 'flex-1' : ''}
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      transition-all duration-200 ease-in-out
      focus:outline-none
    `;
    
    switch (variant) {
      case 'pills':
        return `
          ${baseClasses}
          px-4 py-2 rounded-full
          ${isActive
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
        `;
      case 'underlined':
        return `
          ${baseClasses}
          px-4 py-2 border-b-2
          ${isActive
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
            : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}
        `;
      case 'bordered':
        return `
          ${baseClasses}
          px-4 py-2 border
          ${isActive
            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}
          ${tab.id === tabs[0].id ? 'rounded-l-md' : ''}
          ${tab.id === tabs[tabs.length - 1].id ? 'rounded-r-md' : ''}
          ${tabs.findIndex(t => t.id === tab.id) > 0 ? '-ml-px' : ''}
        `;
      case 'minimal':
        return `
          ${baseClasses}
          px-4 py-2
          ${isActive
            ? 'text-indigo-600 dark:text-indigo-400 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
        `;
      default:
        return `
          ${baseClasses}
          px-4 py-2 rounded-t-md
          ${isActive
            ? 'bg-white dark:bg-gray-800 border-t border-l border-r border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
        `;
    }
  };
  
  // Get tab list classes based on orientation
  const getTabListClasses = () => {
    const baseClasses = `flex ${tabsClassName}`;
    
    if (orientation === 'vertical') {
      return `${baseClasses} flex-col`;
    }
    
    return `${baseClasses} flex-row items-center ${variant === 'default' ? 'border-b border-gray-200 dark:border-gray-700' : ''}`;
  };
  
  // Get tab panel classes
  const getTabPanelClasses = () => {
    const baseClasses = `${panelClassName}`;
    
    if (variant === 'default' && orientation !== 'vertical') {
      return `${baseClasses} pt-4`;
    }
    
    return baseClasses;
  };
  
  // Main component classes
  const mainClasses = orientation === 'vertical'
    ? `flex flex-row ${className}`
    : className;
  
  return (
    <div className={mainClasses} data-testid={testId}>
      <div className={getTabListClasses()} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={getTabButtonClasses(tab)}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            tabIndex={tab.id === activeTab ? 0 : -1}
          >
            <div className="flex items-center">
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {orientation === 'vertical' && <div className="flex-grow" />}
      
      <div 
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className={getTabPanelClasses()}
      >
        {activeTabData?.content}
      </div>
    </div>
  );
};

export default Tabs; 