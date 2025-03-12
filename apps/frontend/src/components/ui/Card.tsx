import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
  noPadding?: boolean;
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  testId?: string;
}

/**
 * A versatile card component that can be used for various UI elements
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  icon,
  badge,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  variant = 'default',
  hover = false,
  clickable = false,
  onClick,
  fullWidth = false,
  noPadding = false,
  bordered = true,
  shadow = 'md',
  rounded = 'md',
  testId,
}) => {
  // Base styles
  const baseClasses = 'bg-white dark:bg-gray-800 overflow-hidden';
  
  // Variant styles
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    primary: 'bg-indigo-50 dark:bg-indigo-900/20',
    secondary: 'bg-gray-50 dark:bg-gray-700',
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'bg-red-50 dark:bg-red-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
  };
  
  // Border styles
  const borderClasses = bordered 
    ? `border ${
        variant === 'default' 
          ? 'border-gray-200 dark:border-gray-700' 
          : variant === 'primary'
            ? 'border-indigo-200 dark:border-indigo-800'
            : variant === 'secondary'
              ? 'border-gray-200 dark:border-gray-600'
              : variant === 'success'
                ? 'border-green-200 dark:border-green-800'
                : variant === 'warning'
                  ? 'border-yellow-200 dark:border-yellow-800'
                  : variant === 'danger'
                    ? 'border-red-200 dark:border-red-800'
                    : 'border-blue-200 dark:border-blue-800'
      }`
    : '';
  
  // Shadow styles
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-md',
    xl: 'shadow-lg',
  };
  
  // Rounded styles
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-3xl',
  };
  
  // Hover effects
  const hoverClasses = hover
    ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1'
    : '';
  
  // Clickable styles
  const clickableClasses = clickable
    ? 'cursor-pointer transition-colors'
    : '';
  
  // Width styles
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const cardClasses = [
    baseClasses,
    variantClasses[variant],
    borderClasses,
    shadowClasses[shadow],
    roundedClasses[rounded],
    hoverClasses,
    clickableClasses,
    widthClasses,
    className,
  ].join(' ');
  
  // Header styles
  const headerClasses = [
    'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
    headerClassName,
  ].join(' ');
  
  // Body styles
  const bodyClasses = [
    noPadding ? '' : 'p-6',
    bodyClassName,
  ].join(' ');
  
  // Footer styles
  const footerClasses = [
    'px-6 py-4 border-t border-gray-200 dark:border-gray-700',
    footerClassName,
  ].join(' ');
  
  return (
    <div 
      className={cardClasses} 
      onClick={clickable ? onClick : undefined}
      data-testid={testId}
    >
      {(title || subtitle || icon || badge) && (
        <div className={headerClasses}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              <div>
                {title && (
                  typeof title === 'string' 
                    ? <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
                    : title
                )}
                {subtitle && (
                  typeof subtitle === 'string'
                    ? <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                    : subtitle
                )}
              </div>
            </div>
            {badge && <div>{badge}</div>}
          </div>
        </div>
      )}
      
      <div className={bodyClasses}>
        {children}
      </div>
      
      {footer && (
        <div className={footerClasses}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 