import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Meta from './Meta';
import Footer from './Footer';
import useWindowSize from '../hooks/useWindowSize';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Main layout component that wraps all pages
 * @param props Layout configuration props
 * @returns Layout component with configured meta, navbar, content and footer
 */
const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  showNavbar = true,
  showFooter = true,
  maxWidth = '2xl',
}) => {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  
  const maxWidthClass = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <>
      <Meta 
        title={title || t('common.defaultTitle')} 
        description={description || t('common.defaultDescription')}
      />
      
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        {showNavbar && <Navbar />}
        
        <main className={`flex-grow mx-auto w-full px-4 py-8 ${maxWidthClass}`}>
          {children}
        </main>
        
        {showFooter && <Footer />}
      </div>
    </>
  );
};

export default Layout; 