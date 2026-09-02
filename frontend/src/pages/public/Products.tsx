import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productApi } from '@/api/client';
import ProductImage from '@/components/ProductImage';
import { formatPrice } from '@/utils/format';
import PageTransition from '@/components/PageTransition';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedSearch(v), 350);
  };

  useEffect(() => {
    setLoading(true);
    productApi.list({ per_page: '100', ...(debouncedSearch ? { q: debouncedSearch } : {}) })
      .then((r) => setProducts(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <div>
        <p className="eyebrow mb-2">Catalog</p>
        <h1 className="text-h1 text-ink-900">All Products</h1>
      </div>

      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="search"
          placeholder="Search products…"
          className="input pl-10"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/product/${p.slug}`} className="card-hover group block overflow-hidden">
                <ProductImage name={p.name} category={p.category?.name} imageBase64={p.image_base64} className="h-40 mb-4" />
                <div className="px-4 pb-4">
                  <h3 className="text-sm font-semibold text-ink-900 group-hover:text-accent-400 transition-colors line-clamp-2 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-micro text-ink-500 line-clamp-2 mb-3">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-h3 text-accent-400">
                      {formatPrice(p.price)}
                    </span>
                    {p.external_store_id && (
                      <span className="badge-neutral text-micro">External</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 card-pad">
          <p className="text-body text-ink-600">
            {search ? 'No products match your search.' : 'No products available.'}
          </p>
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="text-sm text-accent-400 hover:text-accent-300 mt-2 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </PageTransition>
  );
}
