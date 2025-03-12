import React, { ReactNode, CSSProperties } from 'react';
import { useTranslation } from '../../utils/i18n';

interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  compact?: boolean;
  highlightOnHover?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
}

type SizeType = 'sm' | 'md' | 'lg';

/**
 * A reusable table component with support for sorting, loading states, and empty states
 */
function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage,
  onRowClick,
  className = '',
  stickyHeader = false,
  striped = true,
  compact = false,
  highlightOnHover = true,
  sortColumn,
  sortDirection,
  onSort,
}: TableProps<T>) {
  const { t } = useTranslation();
  
  const defaultEmptyMessage = t('common.noData', 'No data available');
  
  // Table header and cell base classes
  const getHeaderClasses = (column: Column<T>): string => `
    ${compact ? 'px-2 py-2' : 'px-4 py-3'} 
    text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
    ${stickyHeader ? 'sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm' : ''}
    ${column.className || ''}
  `;
  
  const getBodyClasses = (index: number): string => `
    ${compact ? 'px-2 py-2' : 'px-4 py-3'}
    ${striped && index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
  `;
  
  const getRowClasses = (): string => `
    ${onRowClick ? 'cursor-pointer' : ''}
    ${highlightOnHover ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
    border-b border-gray-200 dark:border-gray-700 last:border-b-0
  `;
  
  // Sort indicator
  const renderSortIndicator = (columnId: string) => {
    if (sortColumn !== columnId) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };
  
  // Empty state
  if (data.length === 0 && !isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          {emptyMessage || defaultEmptyMessage}
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="py-12 text-center">
          <div className="animate-pulse flex justify-center">
            <div className="h-6 w-6 bg-indigo-200 rounded-full"></div>
            <div className="ml-2 h-6 w-24 bg-indigo-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={getHeaderClasses(column)}
                  onClick={() => {
                    if (column.sortable && onSort) {
                      onSort(column.id);
                    }
                  }}
                  style={{ cursor: column.sortable ? 'pointer' : 'default' } as React.CSSProperties}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && renderSortIndicator(column.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className={getRowClasses()}
                onClick={() => onRowClick && onRowClick(item, index)}
              >
                {columns.map((column) => (
                  <td key={column.id} className={getBodyClasses(index)}>
                    {column.cell(item, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table; 