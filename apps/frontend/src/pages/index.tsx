import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { 
  RocketLaunchIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  BeakerIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import { useTranslation } from '../utils/i18n';
import Meta from '../components/Meta';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const features = [
    {
      title: t('home.features.tokenCreation.title'),
      description: t('home.features.tokenCreation.description'),
      icon: <RocketLaunchIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
    },
    {
      title: t('home.features.transactions.title'),
      description: t('home.features.transactions.description'),
      icon: <CurrencyDollarIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
    },
    {
      title: t('home.features.identity.title'),
      description: t('home.features.identity.description'),
      icon: <ShieldCheckIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
    },
    {
      title: t('home.features.verification.title'),
      description: t('home.features.verification.description'),
      icon: <UserGroupIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
    },
    {
      title: t('home.features.liquidity.title'),
      description: t('home.features.liquidity.description'),
      icon: <BeakerIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
    },
    {
      title: t('home.features.dashboard.title'),
      description: t('home.features.dashboard.description'),
      icon: <ChartBarIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
    }
  ];
  
  const roadmap = [
    {
      phase: t('home.roadmap.phase1.phase'),
      timeline: t('home.roadmap.phase1.timeline'),
      title: t('home.roadmap.phase1.title'),
      description: t('home.roadmap.phase1.description')
    },
    {
      phase: t('home.roadmap.phase2.phase'),
      timeline: t('home.roadmap.phase2.timeline'),
      title: t('home.roadmap.phase2.title'),
      description: t('home.roadmap.phase2.description')
    },
    {
      phase: t('home.roadmap.phase3.phase'),
      timeline: t('home.roadmap.phase3.timeline'),
      title: t('home.roadmap.phase3.title'),
      description: t('home.roadmap.phase3.description')
    },
    {
      phase: t('home.roadmap.phase4.phase'),
      timeline: t('home.roadmap.phase4.timeline'),
      title: t('home.roadmap.phase4.title'),
      description: t('home.roadmap.phase4.description')
    }
  ];

  return (
    <>
      <Meta 
        title={t('home.metaTitle')}
        description={t('home.metaDescription')}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="relative overflow-hidden py-20 md:py-32">
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                  {t('home.hero.title')}
                </h1>
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
                  {t('home.hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  {isAuthenticated ? (
                    <Link href="/dashboard">
                      <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {t('home.hero.enterApp')} <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/register">
                        <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          {t('home.hero.register')}
                        </button>
                      </Link>
                      <Link href="/login">
                        <button className="inline-flex items-center px-6 py-3 border border-indigo-300 dark:border-gray-600 text-base font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          {t('home.hero.login')}
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 dark:opacity-5">
              <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-indigo-500 filter blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-blue-500 filter blur-3xl"></div>
            </div>
          </section>
          
          {/* Features Section */}
          <section id="features" className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.features.title')}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {t('home.features.subtitle')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-indigo-50 dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Steps Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.steps.title')}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {t('home.steps.subtitle')}
                </p>
              </div>
              
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      number: "01",
                      title: t('home.steps.step1.title'),
                      description: t('home.steps.step1.description')
                    },
                    {
                      number: "02",
                      title: t('home.steps.step2.title'),
                      description: t('home.steps.step2.description')
                    },
                    {
                      number: "03",
                      title: t('home.steps.step3.title'),
                      description: t('home.steps.step3.description')
                    }
                  ].map((step, index) => (
                    <div key={index} className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                      <div className="text-4xl font-bold text-indigo-100 dark:text-indigo-900 absolute -top-6 -left-2">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white mt-4">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          
          {/* Roadmap Section */}
          <section id="roadmap" className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('home.roadmap.title')}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {t('home.roadmap.subtitle')}
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                {roadmap.map((phase, index) => (
                  <div key={index} className="flex mb-12 last:mb-0">
                    <div className="mr-6 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                        {index + 1}
                      </div>
                      {index < roadmap.length - 1 && (
                        <div className="w-0.5 h-full bg-indigo-100 dark:bg-indigo-900 my-2"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {phase.phase} • {phase.timeline}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{phase.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center bg-indigo-600 dark:bg-indigo-800 text-white rounded-xl p-10 shadow-xl">
                <h2 className="text-3xl font-bold mb-6">{t('home.cta.title')}</h2>
                <p className="text-lg mb-8 text-indigo-100">
                  {t('home.cta.description')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  {isAuthenticated ? (
                    <Link href="/create-token">
                      <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                        {t('home.cta.createToken')}
                      </button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                        {t('home.cta.registerNow')}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-white dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  DevLaunch
                </div>
                <p className="text-gray-600 dark:text-gray-400">{t('home.footer.tagline')}</p>
              </div>
              <div className="flex space-x-8">
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">{t('nav.about')}</Link>
                <Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">{t('nav.docs')}</Link>
                <a href="https://github.com/devlaunch" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">GitHub</a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
              <p>{t('home.footer.copyright', { year: new Date().getFullYear() })}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}
  };
};

export default HomePage; 