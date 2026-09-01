import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryApi, productApi } from '@/api/client';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([categoryApi.show(slug), productApi.list({ category: slug, q: search })])
      .then(([catRes, prodRes]) => {
        setCategory(catRes.data.category);
        setProducts(prodRes.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, search]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
        {category?.description && <p className="text-gray-500 mt-2">{category.description}</p>}
        <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-200 rounded">{category?.type}</span>
      </div>

      <input
        type="search"
        placeholder="Search products…"
        className="input max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="card hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 mb-2">{p.name}</h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary-600">${Number(p.price).toFixed(2)}</span>
              {p.external_store_id && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">External</span>
              )}
            </div>
          </Link>
        ))}
        {products.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No products found.</p>
        )}
      </div>
    </div>
  );
}
