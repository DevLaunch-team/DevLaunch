import React from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/solid';
import { useTranslation } from '../../utils/i18n';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  showFirstLast?: boolean;
  showPageSizeSelector?: boolean;
  compact?: boolean;
  siblingCount?: number;
  hideNextButton?: boolean;
  hidePrevButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'rounded' | 'simple' | 'minimal';
  showPageSize?: boolean;
  testId?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
  showFirstLast = true,
  showPageSizeSelector = true,
  compact = false,
  siblingCount = 1,
  hideNextButton = false,
  hidePrevButton = false,
  size = 'md',
  variant = 'default',
  showPageSize = false,
  testId,
}) => {
  const { t } = useTranslation();
  
  // Calculate range of pages to show
  const getPageNumbers = () => {
    // Always show 5 page numbers if possible
    const pageNumbers = [];
    const maxPagesToShow = compact ? 3 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust if at the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };
  
  // Get information about items being displayed
  const getItemsInfo = () => {
    if (totalItems === undefined) return null;
    
    const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const end = Math.min(currentPage * pageSize, totalItems);
    
    return (
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {t('pagination.showing', { start, end, total: totalItems })}
      </div>
    );
  };
  
  const buttonClasses = `
    inline-flex items-center justify-center 
    min-w-[36px] h-9 px-2.5
    border border-gray-300 dark:border-gray-600 
    bg-white dark:bg-gray-800
    text-sm font-medium text-gray-700 dark:text-gray-300
    hover:bg-gray-50 dark:hover:bg-gray-700
    focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  // Create page size selector
  const renderPageSizeSelector = () => {
    if (!showPageSizeSelector || !onPageSizeChange) return null;
    
    return (
      <div className="flex items-center ml-4 text-sm text-gray-700 dark:text-gray-300">
        <span className="mr-2">{t('pagination.itemsPerPage')}</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 py-1 pl-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  // Return nothing if there's only 1 page
  if (totalPages <= 1) return null;
  
  // Create page range
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  // Create pagination range with ellipsis
  const getPaginationRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5; // First + Last + Current + 2 Ellipsis + Siblings * 2
    
    // If the total number of pages is less than the total page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }
    
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
    
    // Case: [1, ..., 5, 6, 7, ..., 10]
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, '...', ...middleRange, '...', totalPages];
    }
    
    // Case: [1, 2, 3, 4, 5, ..., 10]
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = range(1, 3 + siblingCount * 2);
      return [...leftRange, '...', totalPages];
    }
    
    // Case: [1, ..., 6, 7, 8, 9, 10]
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = range(totalPages - (3 + siblingCount * 2) + 1, totalPages);
      return [1, '...', ...rightRange];
    }
    
    // Fallback
    return range(1, totalPages);
  };
  
  // Get the pagination range
  const paginationRange = getPaginationRange();
  
  // Handle page click
  const handlePageClick = (page: number) => {
    if (page === currentPage) return;
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };
  
  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: {
      button: 'h-8 w-8 text-xs',
      arrow: 'h-3 w-3',
      text: 'text-xs',
      select: 'text-xs h-8',
    },
    md: {
      button: 'h-10 w-10 text-sm',
      arrow: 'h-4 w-4',
      text: 'text-sm',
      select: 'text-sm h-10',
    },
    lg: {
      button: 'h-12 w-12 text-base',
      arrow: 'h-5 w-5',
      text: 'text-base',
      select: 'text-base h-12',
    },
  };
  
  // Button classes based on variant
  const getButtonClasses = (page: number | string) => {
    const isCurrentPage = page === currentPage;
    const isDisabled = page === '...';
    
    const baseClasses = `
      ${sizeClasses[size].button}
      flex items-center justify-center
      ${isDisabled ? 'cursor-default' : 'cursor-pointer'}
      transition-colors duration-200
      focus:outline-none
    `;
    
    switch (variant) {
      case 'rounded':
        return `
          ${baseClasses}
          rounded-full
          ${isCurrentPage
            ? 'bg-indigo-600 text-white'
            : isDisabled
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
        `;
      case 'simple':
        return `
          ${baseClasses}
          ${isCurrentPage
            ? 'font-bold text-indigo-600 dark:text-indigo-400'
            : isDisabled
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'}
        `;
      case 'minimal':
        return `
          ${baseClasses}
          ${isCurrentPage
            ? 'font-bold text-gray-900 dark:text-white'
            : isDisabled
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
        `;
      default:
        return `
          ${baseClasses}
          rounded-md
          ${isCurrentPage
            ? 'bg-indigo-600 text-white'
            : isDisabled
              ? 'text-gray-400 dark:text-gray-500 bg-transparent'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
        `;
    }
  };
  
  // Navigation button classes
  const getNavButtonClasses = (disabled: boolean) => {
    const baseClasses = `
      ${sizeClasses[size].button}
      flex items-center justify-center
      ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      transition-colors duration-200
      focus:outline-none
    `;
    
    switch (variant) {
      case 'rounded':
        return `
          ${baseClasses}
          rounded-full
          ${disabled
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
        `;
      case 'simple':
      case 'minimal':
        return `
          ${baseClasses}
          ${disabled
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'}
        `;
      default:
        return `
          ${baseClasses}
          rounded-md
          ${disabled
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
        `;
    }
  };
  
  return (
    <div 
      className={`flex items-center justify-between ${className}`}
      data-testid={testId}
    >
      <div className="mb-2 sm:mb-0">
        {getItemsInfo()}
      </div>
      
      <div className="flex items-center">
        <nav className="inline-flex rounded-md shadow-sm">
          {showFirstLast && (
            <button
              className={`${buttonClasses} rounded-l-md`}
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              aria-label={t('pagination.first')}
              title={t('pagination.first')}
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </button>
          )}
          
          <button
            className={`${buttonClasses} ${!showFirstLast ? 'rounded-l-md' : ''}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label={t('pagination.previous')}
            title={t('pagination.previous')}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          {paginationRange.map((page, index) => (
            <button
              key={index}
              className={`
                ${buttonClasses}
                ${currentPage === page ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}
              `}
              onClick={() => typeof page === 'number' && handlePageClick(page)}
              disabled={page === '...'}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          
          <button
            className={`${buttonClasses} ${!showFirstLast ? 'rounded-r-md' : ''}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label={t('pagination.next')}
            title={t('pagination.next')}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          
          {showFirstLast && (
            <button
              className={`${buttonClasses} rounded-r-md`}
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label={t('pagination.last')}
              title={t('pagination.last')}
            >
              <ChevronDoubleRightIcon className="h-4 w-4" />
            </button>
          )}
        </nav>
        
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center">
            <span className={`mr-2 ${sizeClasses[size].text} text-gray-700 dark:text-gray-300`}>
              {t('pagination.rowsPerPage')}:
            </span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className={`
                ${sizeClasses[size].select}
                border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800
                text-gray-700 dark:text-gray-300
                rounded-md
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              `}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination; 