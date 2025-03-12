import React from 'react';
import { useTranslation } from '../utils/i18n';
import ErrorPage from '../components/ui/ErrorPage';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ErrorPage
      title={t('page.notFound')}
      message={t('page.notFoundMessage')}
      statusCode={404}
    />
  );
};

export default NotFoundPage; 