import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryApi, productApi } from '@/api/client';

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([categoryApi.list(), productApi.list({ per_page: '8' })])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.categories ?? []);
        setFeatured(prodRes.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading…</div>;
  }

  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-r from-primary-600 to-primary-900 text-white rounded-2xl p-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Digital Marketplace & Services</h1>
        <p className="text-lg opacity-90">Buy digital products, top-up balances, and request social media services.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="card hover:shadow-md transition flex flex-col items-center text-center"
            >
              <span className="text-3xl mb-2">{categoryEmoji(cat.icon)}</span>
              <h3 className="font-medium text-gray-900">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1 capitalize">{cat.type}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} className="card hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-bold text-primary-600">${Number(p.price).toFixed(2)}</span>
                {p.external_store_id && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">External</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function categoryEmoji(icon: string) {
  const map: Record<string, string> = {
    gamepad: '🎮', message: '💬', 'credit-card': '💳', wallet: '💰',
    design: '🎨', monitor: '📺', server: '🛡️', 'check-circle': '✅',
    cpu: '🤖', handshake: '🤝', share: '🔗',
  };
  return map[icon] ?? '📦';
}
