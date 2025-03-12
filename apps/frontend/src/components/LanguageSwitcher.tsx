import React, { useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { useTranslation } from '../utils/i18n';

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

const LanguageSwitcher: React.FC = () => {
  const { locale, changeLocale } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languages.find(lang => lang.code === locale) || languages[0]
  );
  
  useEffect(() => {
    const lang = languages.find(lang => lang.code === locale);
    if (lang) {
      setCurrentLanguage(lang);
    }
  }, [locale]);
  
  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    changeLocale(language.code);
  };
  
  const isDarkMode = typeof window !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center items-center w-full px-3 py-1.5 text-sm font-medium rounded-md
          border border-gray-300 dark:border-gray-600 
          text-gray-700 dark:text-gray-300 
          bg-white dark:bg-gray-700 
          hover:bg-gray-50 dark:hover:bg-gray-600 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
          <span className="mr-1">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
          <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
        </Menu.Button>
      </div>
      
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md 
          bg-white dark:bg-gray-800 
          shadow-lg ring-1 ring-black ring-opacity-5 
          focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    onClick={() => handleLanguageChange(language)}
                    className={`
                      flex w-full items-center px-4 py-2 text-sm
                      ${active 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300'}
                      ${currentLanguage.code === language.code 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 font-medium' 
                        : ''}
                    `}
                  >
                    <span className="mr-3">{language.flag}</span>
                    <span>{language.name}</span>
                    <span className="ml-2 text-gray-400">({language.nativeName})</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguageSwitcher; 