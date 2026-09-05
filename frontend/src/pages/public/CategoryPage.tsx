import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryApi, productApi } from '@/api/client';
import ProductImage from '@/components/ProductImage';
import { formatPrice } from '@/utils/format';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';
import { localized } from '@/utils/localize';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function CategoryPage() {
  const { slug } = useParams();
  const { t, locale } = useI18n();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Debounce search ────────────────────────────────────────
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 350);
  };

  // ── Load category + initial products ──────────────────────
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    categoryApi.show(slug)
      .then((res) => {
        const cat = res.data.category;
        setCategory(cat);
        // Use products from the enriched category response when there's no search
        setProducts(cat.products ?? []);
        setLoading(false);
      })
      .catch(() => {
        setCategory(null);
        setProducts([]);
        setLoading(false);
      });
  }, [slug]);

  // ── Refetch products when debounced search changes ─────────
  useEffect(() => {
    if (!slug) return;
    // Skip if we haven't loaded the category yet
    if (category === null) return;

    // If no search term, use the category's products (already loaded)
    if (!debouncedSearch) return;

    productApi.list({ category: slug, q: debouncedSearch })
      .then((res) => setProducts(res.data.data ?? []))
      .catch(console.error);
  }, [debouncedSearch, slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <PageTransition className="text-center py-24 card-pad">
        <p className="text-h3 text-gray-600 dark:text-ink-600 mb-4">Category not found.</p>
        <Link to="/" className="btn-accent">Back to home</Link>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      {/* Header */}
      <div>
        <Breadcrumbs
          items={[
            { label: t('nav.home'), link: '/' },
            { label: localized(category, 'name', 'name_ar', locale) },
          ]}
        />
        <div className="flex items-start justify-between gap-4 mt-4">
          <div>
            <h1 className="text-h1 text-gray-900 dark:text-ink-900 mb-2">{localized(category, 'name', 'name_ar', locale)}</h1>
            {category.description && (
              <p className="text-body text-gray-600 dark:text-ink-600">{localized(category, 'description', 'description_ar', locale)}</p>
            )}
          </div>
          <span className="badge-neutral mt-1 shrink-0">{category.type}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-ink-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search products…"
          className="input pl-10"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`/product/${p.slug}`}
                className="card-hover group block overflow-hidden"
              >
                <ProductImage
                  name={localized(p, 'name', 'name_ar', locale)}
                  category={localized(category, 'name', 'name_ar', locale)}
                  imageBase64={p.image_base64}
                  imageUrl={p.image_url}
                  className="h-36 mb-4"
                />
                <div className="px-4 pb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-ink-900 group-hover:text-accent-400 transition-colors line-clamp-2 mb-1">
                    {localized(p, 'name', 'name_ar', locale)}
                  </h3>
                  <p className="text-micro text-gray-600 dark:text-ink-500 line-clamp-2 mb-3">
                    {localized(p, 'description', 'description_ar', locale)}
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
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-ink-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" strokeLinecap="round" />
          </svg>
          <p className="text-body text-gray-600 dark:text-ink-600">
            {search ? 'No products match your search.' : 'No products in this category yet.'}
          </p>
          {search && (
            <button
              onClick={() => handleSearchChange('')}
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
