import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeApi } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useI18n } from '@/i18n';
import { localized } from '@/utils/localize';

export default function MyStores() {
  const { locale } = useI18n();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeApi.my()
      .then((res) => setStores(res.data.stores ?? []))
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
      <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'My Stores' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-gray-900 dark:text-ink-900">My Stores</h1>
        <Link to="/create-store" className="btn-accent">Create New Store</Link>
      </div>

      {stores.length === 0 ? (
        <div className="card-pad text-center py-16">
          <p className="text-body text-gray-600 dark:text-ink-600 mb-4">You haven't created any stores yet.</p>
          <Link to="/create-store" className="btn-accent">Create Your First Store</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="card-pad">
              <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-ink-900 mb-1">
                {store.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-ink-500 mb-1">/{store.slug}</p>
              <p className="text-sm text-gray-600 dark:text-ink-500 mb-4">
                {store.products_count} products
              </p>
              <Link
                to={`/store/${store.slug}`}
                className="text-sm text-green-500 hover:text-green-400 transition-colors"
              >
                View Store →
              </Link>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}