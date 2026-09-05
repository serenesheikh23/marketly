import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { settingsApi } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';

interface LegalMeta {
  terms:   { title: string; heading: string };
  privacy: { title: string; heading: string };
  refund:  { title: string; heading: string };
}

const META: LegalMeta = {
  terms:   { title: 'Terms of Service',   heading: 'Terms of Service' },
  privacy: { title: 'Privacy Policy',       heading: 'Privacy Policy' },
  refund:  { title: 'Refund Policy',       heading: 'Refund Policy' },
};

export default function LegalPage() {
  const { page } = useParams<{ page: string }>();
  const { t } = useI18n();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const key = (page ?? 'terms') as keyof typeof META;
  const meta = META[key];

  useEffect(() => {
    setLoading(true);
    settingsApi.legal(key)
      .then((r) => setContent(r.data.content ?? ''))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, [key]);

  return (
    <PageTransition className="max-w-3xl mx-auto">
      <h1 className="text-h1 text-gray-900 dark:text-ink-900 mb-2">{meta.heading}</h1>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[100, 90, 100, 75, 100, 85].map((w, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-ink-100 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : content ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none mt-6
                     prose-headings:text-gray-900 dark:prose-headings:text-ink-900
                     prose-p:text-gray-600 dark:prose-p:text-ink-600
                     prose-li:text-gray-600 dark:prose-li:text-ink-600"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
        />
      ) : (
        <p className="mt-6 text-body text-gray-600 dark:text-ink-600">{t('legal.beingUpdated')}</p>
      )}
    </PageTransition>
  );
}
