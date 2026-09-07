import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Gamepad2, MessageCircle, CreditCard, Wallet, Palette, Bot, ArrowUpRight } from 'lucide-react';
import { categoryApi, productApi } from '@/api/client';
import { useAppSelector } from '@/store';
import ProductImage from '@/components/ProductImage';
import { formatPrice } from '@/utils/format';
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

const reveal = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
});

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { t, locale } = useI18n();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

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
        <span className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition className="relative overflow-hidden">
      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 space-y-10">

        {/* Hero section */}
        <motion.section
          className="relative w-full overflow-hidden"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-50 dark:opacity-40"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,197,94,0.10), transparent 45%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.06] dot-bg" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start pt-6 pb-10">
            <div className="lg:col-span-12 lg:col-start-1 lg:pt-12">
              <motion.div {...reveal(0)} className="flex items-center gap-3 mb-8">
                <span className="inline-block w-10 h-px bg-green-500" />
                <span className="eyebrow text-green-400">{t('home.digitalMarketplace')}</span>
              </motion.div>
              <motion.h1
                {...reveal(1)}
                className="font-heading font-bold leading-[0.95] text-gray-900 dark:text-ink-900 mb-8
                           text-[clamp(2.75rem,7vw,5.5rem)] tracking-tightest text-balance"
              >
                {t('home.heroTitle1')}
                <br />
                <span className="relative inline-block">
                  <span className="text-green-500">{t('home.heroTitle2')}</span>
                  <svg className="absolute -bottom-3 start-0 w-full h-3 text-green-500" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden>
                    <path d="M2 8 Q 50 1, 100 6 T 198 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </motion.h1>
              <motion.p {...reveal(2)} className="text-body-lg text-gray-600 dark:text-ink-600 mb-10 max-w-md text-pretty">
                {t('home.heroDescription')}
              </motion.p>
              <motion.div {...reveal(3)} className="flex flex-wrap items-center gap-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/products" className="btn-accent group">
                      {t('home.continueShopping')}
                      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <Link to="/dashboard" className="btn-secondary hover:-translate-y-1 hover:border-green-500/40 hover:shadow-glow">
                      {t('home.goToDashboard')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/products" className="btn-accent group">
                      {t('home.browseProducts')}
                      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <Link to="/register" className="btn-secondary hover:-translate-y-1 hover:border-green-500/40 hover:shadow-glow">
                      {t('home.createAccount')}
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ── FLOATING ICONS GAP ── between hero buttons and "BROWSE Categories" */}
        <div className="relative overflow-hidden w-full h-32 lg:h-44 flex-shrink-0">
          <div className="relative w-full h-full">
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 5, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 5, delay: 0, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[5%] left-[8%]"
            >
              <Gamepad2 size={34} className="text-green-400 drop-shadow-lg" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 18, 0], x: [0, -8, 0], rotate: [0, -6, 0] }}
              transition={{ duration: 6, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[35%] right-[5%]"
            >
              <MessageCircle size={28} className="text-green-300 drop-shadow-lg" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 4.8, delay: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[20%] left-[15%]"
            >
              <CreditCard size={30} className="text-green-500 drop-shadow-lg" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 12, 0], x: [0, -5, 0], rotate: [0, -4, 0] }}
              transition={{ duration: 5.5, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[15%] left-[45%]"
            >
              <Wallet size={24} className="text-green-400 drop-shadow-lg" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0], x: [0, 6, 0], rotate: [0, 7, 0] }}
              transition={{ duration: 6.5, delay: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[10%] right-[25%]"
            >
              <Palette size={26} className="text-green-300 drop-shadow-lg" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 15, 0], x: [0, -8, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 5.2, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[35%] left-[70%]"
            >
              <Bot size={32} className="text-green-500 drop-shadow-lg" />
            </motion.div>
          </div>
        </div>

        {/* Categories */}
        <section>
          <motion.div {...reveal(0)} className="flex items-end justify-between mb-10">
            <div className="max-w-xl">
              <p className="eyebrow mb-2">{t('home.browse')}</p>
              <h2 className="font-heading text-[clamp(1.875rem,3.5vw,2.75rem)] text-gray-900 dark:text-ink-900 leading-[1.05] text-balance">
                {t('home.categories')}
              </h2>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(categories ?? []).map((cat, i) => (
              <motion.div key={cat.id} {...reveal(i)}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="card-hover group block overflow-hidden h-full bg-white dark:bg-ink-50 rounded-2xl border border-gray-200 dark:border-ink-200 shadow-sm"
                >
                  <div className="relative p-5 min-h-[160px] flex flex-col">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={localized(cat, 'name', 'name_ar', locale)}
                        loading="lazy"
                        className="w-12 h-12 rounded-xl object-cover mb-auto transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-12 h-12 text-2xl rounded-xl bg-gray-100 dark:bg-ink-100 flex items-center justify-center mb-auto">
                        <span aria-hidden="true">{CATEGORY_ICON[cat.icon] ?? '📦'}</span>
                      </div>
                    )}
                    <div className="mt-4">
                      <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-ink-900 group-hover:text-green-500 transition-colors">
                        {localized(cat, 'name', 'name_ar', locale)}
                      </h3>
                      <p className="text-micro text-gray-600 dark:text-ink-500 uppercase mt-1 tracking-wider">{cat.type}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <motion.div {...reveal(0)} className="flex items-end justify-between mb-10">
            <div className="max-w-xl">
              <p className="eyebrow mb-2">{t('home.hotRightNow')}</p>
              <h2 className="font-heading text-[clamp(1.875rem,3.5vw,2.75rem)] text-gray-900 dark:text-ink-900 leading-[1.05] text-balance">
                {t('home.featuredProducts')}
              </h2>
            </div>
            <Link to="/products" className="group inline-flex items-center gap-1 text-sm text-green-500 hover:text-green-400 transition-colors">
              {t('home.viewAll')}
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(featured ?? []).slice(0, 8).map((p, i) => (
              <motion.div key={p.id} {...reveal(i)} className="h-full">
                <Link
                  to={`/product/${p.slug}`}
                  className="card-hover group block overflow-hidden h-full bg-white dark:bg-ink-50 rounded-2xl border border-gray-200 dark:border-ink-200 shadow-sm"
                >
                  <div className="relative h-44 overflow-hidden">
                    <ProductImage
                      name={localized(p, 'name', 'name_ar', locale)}
                      category={localized(p.category, 'name', 'name_ar', locale)}
                      imageBase64={p.image_base64}
                      imageUrl={p.image_url}
                      className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-ink-900 group-hover:text-green-500 transition-colors line-clamp-2 mb-2">
                      {localized(p, 'name', 'name_ar', locale)}
                    </h3>
                    <p className="text-micro text-gray-500 dark:text-ink-500 line-clamp-1 mb-4">
                      {localized(p, 'description', 'description_ar', locale)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-h3 text-green-500 font-bold tabular-nums">
                        {formatPrice(p.price)}
                      </span>
                      <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-ink-500 group-hover:text-green-500 transition-colors">
                        View
                        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </PageTransition>
  );
}