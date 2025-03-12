import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useTranslation } from '../utils/i18n';
import { 
  RocketLaunchIcon, 
  LightBulbIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ROUTES } from '../constants/tooltips';

// Define team member type
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
}

// Define value type
interface CompanyValue {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  // Team members data
  const teamMembers: TeamMember[] = [
    { 
      name: 'Wei Zhang', 
      role: 'Founder & CEO',
      bio: 'Blockchain technology expert with 10 years of software development experience, previously served as a technical lead at top tech companies.',
      image: '/team/founder.jpg' 
    },
    { 
      name: 'Na Li', 
      role: 'Chief Technology Officer',
      bio: 'Full-stack developer and Solana ecosystem expert who has contributed to multiple successful blockchain projects.',
      image: '/team/cto.jpg' 
    },
    { 
      name: 'Fang Wang', 
      role: 'Product Designer',
      bio: 'UI/UX specialist focused on creating intuitive and user-friendly interfaces with extensive experience in fintech product design.',
      image: '/team/designer.jpg' 
    },
    { 
      name: 'Qiang Liu', 
      role: 'Marketing Director',
      bio: 'Cryptocurrency marketing expert skilled in community building and user growth, with extensive experience in the blockchain industry.',
      image: '/team/marketing.jpg' 
    }
  ];

  // Mission and values
  const values: CompanyValue[] = [
    {
      icon: <RocketLaunchIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: 'Making Innovation Easier',
      description: 'We are dedicated to simplifying the token creation and management process, allowing innovators to focus on their ideas and business.'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: 'Security First',
      description: 'Security is our top priority. Our platform employs best security practices to protect our users\' assets and data.'
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: 'Empowering Global Creators',
      description: 'Our goal is to enable creators worldwide to easily enter the blockchain world without technical barriers.'
    },
    {
      icon: <UsersIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: 'Community Driven',
      description: 'We believe that a strong community is key to success. We actively listen to user feedback and continuously improve our products.'
    }
  ];

  return (
    <>
      <Head>
        <title>About Us | DevLaunch</title>
        <meta name="description" content="Learn about DevLaunch's mission, vision, and team" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        {/* Hero section */}
        <div className="bg-indigo-700 dark:bg-indigo-900">
          <div className="container mx-auto px-4 py-24 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Mission is to Simplify Blockchain Innovation</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              DevLaunch is a platform designed for developers and entrepreneurs to easily create and manage Solana tokens without diving into complex technical details.
            </p>
          </div>
        </div>
        
        {/* Our story */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Story</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  DevLaunch was born in 2023, founded by a group of developers passionate about blockchain technology. We noticed that despite Solana blockchain's excellent performance and low transaction fees, creating and managing tokens remained a technical challenge for many developers and entrepreneurs.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  Our team combined extensive blockchain development experience and user experience design expertise to create an intuitive, secure, and powerful platform that enables anyone to launch their own Solana token in minutes.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Today, DevLaunch has helped hundreds of projects successfully issue tokens on the Solana blockchain and continues to be committed to providing the best token creation and management experience. We believe that by lowering technical barriers, we can facilitate the birth and development of more innovative projects.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Values */}
        <div className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {values.map((value, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="flex items-start">
                    <div className="mr-4 p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Team intro */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 relative bg-gradient-to-r from-indigo-500 to-purple-500">
                  {/* Placeholder, replace with team member photos in actual project */}
                  <div className="flex items-center justify-center h-full text-white">
                    <SparklesIcon className="h-16 w-16" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 mb-4">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Vision and future */}
        <div className="bg-indigo-100 dark:bg-indigo-900/30 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <LightBulbIcon className="h-16 w-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Vision</h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-10">
                We are committed to becoming the most user-friendly and reliable token creation and management platform in the Solana ecosystem.
                Our goal is to simplify blockchain technology, enabling millions of innovators worldwide to easily implement their ideas.
              </p>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Future Roadmap</h3>
                <ul className="space-y-4 text-left">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-3 mt-1">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Expand support for more Solana token standards</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-3 mt-1">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Introduce advanced token features like lock periods, vesting schedules, and governance mechanisms</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center mr-3 mt-1">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Develop token exchange and liquidity pool creation tools</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center mr-3 mt-1">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Create integrated token analytics and market monitoring tools</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 mt-1">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Extend support to other blockchain platforms, enabling cross-chain token management</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact us */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Join Our Journey</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              We are always looking for partners, investors, and talent. If you're interested in our mission, we'd love to connect with you!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href={ROUTES.CONTACT} passHref>
                <button className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800">
                  Contact Us
                </button>
              </Link>
              <Link href="/careers" passHref>
                <button className="inline-flex items-center justify-center px-6 py-3 border border-indigo-300 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 dark:bg-gray-800 dark:text-indigo-400 dark:border-gray-600 dark:hover:bg-gray-700">
                  View Career Opportunities
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage; 