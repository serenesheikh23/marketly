import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, MessageCircle, CreditCard, Wallet, Palette, Bot } from 'lucide-react';
import { categoryApi, productApi } from '@/api/client';
import { useAppSelector } from '@/store';
import ProductImage from '@/components/ProductImage';
import { formatPrice } from '@/utils/format';
import HeroArt from '@/components/HeroArt';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';
import { localized } from '@/utils/localize';

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
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { t, locale } = useI18n();

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
      <section className="relative w-full rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20">
        {/* Full-width aurora background */}
        <div className="absolute inset-0 opacity-40 dark:opacity-40 pointer-events-none">
          <HeroArt variant="aurora" className="w-full h-full" />
        </div>

        {/* Hero content + modern visual */}
        <div className="relative z-10 px-8 py-14 md:px-14 md:py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Left: text */}
          <div className="flex-1 max-w-2xl">
            <p className="eyebrow mb-4">{t('home.digitalMarketplace')}</p>
            <h1 className="text-display-2 text-gray-900 dark:text-ink-900 mb-4 text-balance">
              {t('home.heroTitle1')}<br />
              <span className="text-accent-400">{t('home.heroTitle2')}</span>
            </h1>
            <p className="text-body-lg text-gray-600 dark:text-ink-600 mb-8 max-w-lg">
              {t('home.heroDescription')}
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/products" className="btn-accent">
                    {t('home.continueShopping')}
                  </Link>
                  <Link to="/dashboard" className="btn-secondary">
                    {t('home.goToDashboard')}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/products" className="btn-accent">
                    {t('home.browseProducts')}
                  </Link>
                  <Link to="/register" className="btn-secondary">
                    {t('home.createAccount')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: randomly scattered floating icons - NO circle, NO box */}
          <div className="relative w-full lg:w-1/3 h-64 lg:h-80 flex-shrink-0 mt-8 lg:mt-0">
            {/* Gamepad2 — far top-left */}
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 5, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 5, delay: 0, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[5%] left-[8%]"
            >
              <Gamepad2 size={34} className="text-accent-400 drop-shadow-lg" />
            </motion.div>

            {/* MessageCircle — middle-right */}
            <motion.div
              animate={{ y: [0, 18, 0], x: [0, -8, 0], rotate: [0, -6, 0] }}
              transition={{ duration: 6, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[35%] right-[5%]"
            >
              <MessageCircle size={28} className="text-accent-300 drop-shadow-lg" />
            </motion.div>

            {/* CreditCard — bottom-left */}
            <motion.div
              animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 4.8, delay: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[20%] left-[15%]"
            >
              <CreditCard size={30} className="text-accent-500 drop-shadow-lg" />
            </motion.div>

            {/* Wallet — top-center */}
            <motion.div
              animate={{ y: [0, 12, 0], x: [0, -5, 0], rotate: [0, -4, 0] }}
              transition={{ duration: 5.5, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[15%] left-[45%]"
            >
              <Wallet size={24} className="text-accent-400 drop-shadow-lg" />
            </motion.div>

            {/* Palette — bottom-right */}
            <motion.div
              animate={{ y: [0, -10, 0], x: [0, 6, 0], rotate: [0, 7, 0] }}
              transition={{ duration: 6.5, delay: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[10%] right-[25%]"
            >
              <Palette size={26} className="text-accent-300 drop-shadow-lg" />
            </motion.div>

            {/* Bot — far bottom-center */}
            <motion.div
              animate={{ y: [0, 15, 0], x: [0, -8, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 5.2, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[35%] left-[70%]"
            >
              <Bot size={32} className="text-accent-500 drop-shadow-lg" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-1">{t('home.browse')}</p>
            <h2 className="text-h2 text-gray-900 dark:text-ink-900">{t('home.categories')}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {(categories ?? []).map((cat, i) => (
            <motion.div key={cat.id} {...stagger(i)}>
              <Link
                to={`/category/${cat.slug}`}
                className="card-hover block p-5 text-center group"
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={localized(cat, 'name', 'name_ar', locale)}
                    loading="lazy"
                    className="w-12 h-12 mx-auto mb-3 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-ink-100 flex items-center justify-center">
                    <span className="text-2xl" aria-hidden="true">{CATEGORY_ICON[cat.icon] ?? '📦'}</span>
                  </div>
                )}
                <h3 className="text-sm font-semibold text-gray-900 dark:text-ink-900 group-hover:text-accent-400 transition-colors">
                  {localized(cat, 'name', 'name_ar', locale)}
                </h3>
                <p className="text-micro text-gray-600 dark:text-ink-500 uppercase mt-1">{cat.type}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-1">{t('home.hotRightNow')}</p>
            <h2 className="text-h2 text-gray-900 dark:text-ink-900">{t('home.featuredProducts')}</h2>
          </div>
          <Link
            to="/products"
            className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
          >
            {t('home.viewAll')} →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(featured ?? []).map((p, i) => (
            <motion.div key={p.id} {...stagger(i)}>
              <Link
                to={`/product/${p.slug}`}
                className="card-hover group block overflow-hidden"
              >
                <ProductImage
                  name={localized(p, 'name', 'name_ar', locale)}
                  category={localized(p.category, 'name', 'name_ar', locale)}
                  imageBase64={p.image_base64}
                  imageUrl={p.image_url}
                  className="h-40 mb-4"
                />
                <div className="px-4 pb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-ink-900 group-hover:text-accent-400 transition-colors line-clamp-2 mb-1">
                    {localized(p, 'name', 'name_ar', locale)}
                  </h3>
                  <p className="text-micro text-gray-600 dark:text-ink-500 line-clamp-1 mb-3">
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
      </section>

    </PageTransition>
  );
}