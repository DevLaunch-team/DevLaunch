import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  Bars3Icon as MenuIcon, 
  XMarkIcon as XIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon as LogoutIcon,
  Cog6ToothIcon as CogIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon as SwitchHorizontalIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../utils/i18n';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();
  const { t } = useTranslation();
  const { connected } = useWallet();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const navigation = [
    { name: t('nav.home'), href: '/', icon: HomeIcon },
    { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('nav.tokens'), href: '/tokens', icon: CurrencyDollarIcon },
    { name: t('nav.wallet'), href: '/wallet', icon: CurrencyDollarIcon },
    { name: t('nav.transactions'), href: '/transactions', icon: SwitchHorizontalIcon },
    { name: t('nav.createToken'), href: '/create-token', icon: PlusCircleIcon },
    { name: t('nav.about'), href: '/about', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ) },
    { name: t('nav.contact'), href: '/contact', icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ) },
  ];

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <nav className={`bg-white shadow-md dark:bg-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <img 
                    className="h-8 w-auto" 
                    src="/logo.svg" 
                    alt="DevLaunch Logo" 
                  />
                  <span className="ml-2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    DevLaunch
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                >
                  <span
                    className={`${
                      isActive(item.href)
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}
                  >
                    <item.icon className="h-5 w-5 mr-1" />
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
            
            <div className="h-8">
              <WalletMultiButton />
            </div>
            
            {isLoggedIn ? (
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="bg-white dark:bg-gray-700 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                      {username}
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <Link href="/profile">
                          <span
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-600' : ''
                            } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer flex items-center`}
                          >
                            <UserCircleIcon className="mr-2 h-5 w-5" />
                            {t('common.profile')}
                          </span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link href="/settings">
                          <span
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-600' : ''
                            } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer flex items-center`}
                          >
                            <CogIcon className="mr-2 h-5 w-5" />
                            {t('common.settings')}
                          </span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-600' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center`}
                        >
                          <LogoutIcon className="mr-2 h-5 w-5" />
                          {t('common.logout')}
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <button className="px-3 py-1.5 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-400">
                    {t('auth.login')}
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    {t('auth.register')}
                  </button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
            >
              <span
                className={`${
                  isActive(item.href)
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer flex items-center`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </span>
            </Link>
          ))}
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-around px-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <WalletMultiButton />
          </div>
          
          {isLoggedIn ? (
            <div className="mt-3">
              <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                {username}
              </div>
              <Link href="/profile">
                <div className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center">
                  <UserCircleIcon className="mr-2 h-5 w-5" />
                  {t('common.profile')}
                </div>
              </Link>
              <Link href="/settings">
                <div className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center">
                  <CogIcon className="mr-2 h-5 w-5" />
                  {t('common.settings')}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center"
              >
                <LogoutIcon className="mr-2 h-5 w-5" />
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-1 px-4 flex flex-col">
              <Link href="/login">
                <button className="w-full py-2 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-400">
                  {t('auth.login')}
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  {t('auth.register')}
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 