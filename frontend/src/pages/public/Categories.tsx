import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryApi } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useI18n } from '@/i18n';
import { localized } from '@/utils/localize';

export default function Categories() {
  const { t, locale } = useI18n();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.list()
      .then((res) => {
        const all = res.data.categories ?? [];
        setCategories(all.filter((c: any) => !c.parent_id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <Breadcrumbs items={[{ label: t('nav.home') ?? 'Home', link: '/' }, { label: 'Categories' }]} />
      <h1 className="text-h1 text-gray-900 dark:text-ink-900">Categories</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const name = localized(cat, 'name', 'name_ar', locale);
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              <Link
                to={`/category/${cat.slug}`}
                className="card-hover group block overflow-hidden h-full bg-white dark:bg-ink-50 rounded-2xl border border-gray-200 dark:border-ink-200 shadow-sm p-5"
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={name}
                    loading="lazy"
                    className="w-12 h-12 rounded-xl object-cover mb-4 transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center text-2xl font-bold mb-4">
                    {name.trim().charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-ink-900 group-hover:text-green-500 transition-colors">
                  {name}
                </h3>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </PageTransition>
  );
}