import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from '../utils/i18n';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

/**
 * Meta component for handling page metadata and SEO
 */
const Meta: React.FC<MetaProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  canonicalUrl,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  
  const siteName = 'DevLaunch';
  const defaultDescription = t('meta.defaultDescription') || 'Launch your Solana token with ease using DevLaunch platform';
  const defaultKeywords = t('meta.defaultKeywords') || 'solana, token, blockchain, crypto, devlaunch';
  
  // Format title to ensure it includes the site name
  const formattedTitle = title 
    ? `${title}${!title.includes(siteName) ? ` | ${siteName}` : ''}`
    : `${siteName} - ${t('meta.defaultTitle') || 'Solana Token Launch Platform'}`;

  // Determine canonical URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = router.asPath.split('#')[0].split('?')[0];
  const resolvedCanonicalUrl = canonicalUrl || `${origin}${path}`;
  
  // Determine OG URL
  const resolvedOgUrl = ogUrl || `${origin}${path}`;
  
  // Determine OG Image with absolute URL
  const resolvedOgImage = ogImage && !ogImage.startsWith('http') 
    ? `${origin}${ogImage}` 
    : ogImage || `${origin}/og-image.jpg`;

  return (
    <Head>
      <title>{formattedTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={resolvedCanonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={resolvedOgUrl} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:locale" content={router.locale || 'en'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@Dev_Launch_" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
      
      {/* Mobile and App */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#4F46E5" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* GitHub */}
      <meta name="github:site" content="https://github.com/DevLaunch-team/DevLaunch" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default Meta; 