import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryApi, productApi } from '@/api/client';
import ProductImage from '@/components/ProductImage';
import HeroArt from '@/components/HeroArt';
import PageTransition from '@/components/PageTransition';

const CATEGORY_ICON: Record<string, string> = {
  gamepad:      '🎮',
  message:      '💬',
  'credit-card':'💳',
  wallet:       '💰',
  design:       '🎨',
  monitor:      '📺',
  server:       '🛡️',
  'check-circle':'✅',
  cpu:          '🤖',
  handshake:    '🤝',
  share:        '🔗',
};

function stagger(i: number) {
  return { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } };
}

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoryApi.list(),
      productApi.list({ per_page: '8' }),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data.categories ?? []);
        setFeatured(prodRes.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-16">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">
        {/* Art behind content */}
        <div className="absolute inset-0 opacity-40">
          <HeroArt variant="aurora" className="w-full h-full" />
        </div>
        <div className="relative z-10 px-10 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <p className="eyebrow mb-4">Digital Marketplace</p>
            <h1 className="text-display-2 text-ink-900 mb-4 text-balance">
              The modern way to<br />
              <span className="text-accent-400">buy digital.</span>
            </h1>
            <p className="text-body-lg text-ink-600 mb-8 max-w-lg">
              Instant auto-delivery, manual services, and secure payments — all in one place. No fluff, no delays.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/category/software" className="btn-accent">
                Browse products
              </Link>
              <Link to="/register" className="btn-secondary">
                Create account
              </Link>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="hidden md:grid grid-cols-2 gap-3 w-64">
            {[
              { label: 'Products', value: '500+' },
              { label: 'Categories', value: categories.length.toString() },
              { label: 'Avg. delivery', value: '< 30s' },
              { label: 'Uptime', value: '99.9%' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="card-pad text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
              >
                <p className="text-h3 text-accent-400">{s.value}</p>
                <p className="text-micro text-ink-500 uppercase">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-1">Browse</p>
            <h2 className="text-h2 text-ink-900">Categories</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} {...stagger(i)}>
              <Link
                to={`/category/${cat.slug}`}
                className="card-hover block p-5 text-center group"
              >
                <span className="text-3xl mb-3 block" role="img" aria-hidden>
                  {CATEGORY_ICON[cat.icon] ?? '📦'}
                </span>
                <h3 className="text-sm font-semibold text-ink-900 group-hover:text-accent-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-micro text-ink-500 uppercase mt-1">{cat.type}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-1">Hot right now</p>
            <h2 className="text-h2 text-ink-900">Featured products</h2>
          </div>
          <Link
            to="/category/software"
            className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((p, i) => (
            <motion.div key={p.id} {...stagger(i)}>
              <Link
                to={`/product/${p.slug}`}
                className="card-hover group block overflow-hidden"
              >
                <ProductImage
                  name={p.name}
                  category={p.category?.name}
                  className="h-40 mb-4"
                />
                <div className="px-4 pb-4">
                  <h3 className="text-sm font-semibold text-ink-900 group-hover:text-accent-400 transition-colors line-clamp-2 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-micro text-ink-500 line-clamp-1 mb-3">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-h3 text-accent-400">
                      ${Number(p.price).toFixed(2)}
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
      </section>

    </PageTransition>
  );
}
