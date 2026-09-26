import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryApi, productApi } from '@/api/client';
import ProductImage from '@/components/ProductImage';
import PageTransition from '@/components/PageTransition';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useI18n } from '@/i18n';
import { localized } from '@/utils/localize';
import { categoryEmoji } from '@/utils/categoryEmoji';
import { GENERIC_ICONS } from '@/utils/oranosCategories';

const CATEGORY_ICON: Record<string, string> = {
  gamepad: '🎮', message: '💬', 'credit-card': '💳', wallet: '💰',
  design: '🎨', monitor: '📺', server: '🛡️', 'check-circle': '✅',
  cpu: '🤖', handshake: '🤝', share: '🔗',
};

const reveal = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
});

function buildBreadcrumbs(category: any, allCategories: any[]): Array<{label: string, link?: string}> {
  const chain = [];
  let current = category;
  
  // Walk up the parent chain
  while (current) {
    chain.unshift({
      label: current.name ?? current.name_ar ?? 'Unknown',
      link: current.parent_id ? `/category/${current.slug}` : undefined
    });
    if (current.parent_id) {
      current = allCategories.find((c: any) => c.id === current.parent_id);
    } else {
      current = null;
    }
  }
  
  // Add home and categories as root
  return [
    { label: 'الرئيسية', link: '/' },
    { label: 'الفئات', link: '/categories' },
    ...chain
  ];
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useI18n();
  const [all, setAll] = useState<any[]>([]);
  const [category, setCategory] = useState<any | null>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      categoryApi.list(),
      categoryApi.show(slug)
    ])
      .then(([listRes, showRes]) => {
        const list = listRes.data.categories ?? [];
        setAll(list);
        
        const cat = showRes.data.category;
        if (!cat) {
          setCategory(null);
          return null;
        }
        setCategory(cat);
        setChildren(cat.children ?? []);
        return productApi.list({ category: String(cat.id), per_page: '60' });
      })
      .then((prodRes) => {
        if (prodRes?.data?.data) setProducts(prodRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <PageTransition className="space-y-6">
        <h1 className="text-h1">Category not found</h1>
        <Link to="/categories" className="text-green-500">← Back to categories</Link>
      </PageTransition>
    );
  }

  const catName = localized(category, 'name', 'name_ar', locale);
  const showChildren = children.length > 0;
  const breadcrumbItems = buildBreadcrumbs(category, all);

  return (
    <PageTransition className="space-y-10">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Subcategories section */}
      {showChildren && (
        <section>
          <div className="mb-6">
            <p className="eyebrow mb-2">{t('home.browse') ?? 'Browse'}</p>
            <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] text-gray-900 dark:text-ink-900">
              {catName}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {children.map((child, i) => {
              const childName = localized(child, 'name', 'name_ar', locale);
              const emoji = GENERIC_ICONS.includes(child.icon ?? '')
                ? categoryEmoji(childName)
                : (CATEGORY_ICON[child.icon] ?? categoryEmoji(childName));
              return (
                <motion.div key={child.id} {...reveal(i)}>
                  <Link
                    to={`/category/${child.slug}`}
                    className="card-hover group block overflow-hidden h-full bg-white dark:bg-ink-50 rounded-2xl border border-gray-200 dark:border-ink-200 shadow-sm"
                  >
                    <div className="relative p-4 min-h-[130px] flex flex-col">
                      {child.image_url ? (
                        <img
                          src={child.image_url}
                          alt={childName}
                          loading="lazy"
                          className="w-11 h-11 rounded-xl object-cover mb-auto transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-11 h-11 text-xl rounded-xl bg-gray-100 dark:bg-ink-100 flex items-center justify-center mb-auto">
                          <span aria-hidden="true">{emoji}</span>
                        </div>
                      )}
                      <div className="mt-3">
                        <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-ink-900 group-hover:text-green-500 transition-colors line-clamp-2">
                          {childName}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Products section */}
      {products.length > 0 && (
        <section>
          <div className="mb-6">
            <p className="eyebrow mb-2">{t('home.hotRightNow') ?? 'Products'}</p>
            <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] text-gray-900 dark:text-ink-900">
              {showChildren ? `${t('home.browse') ?? 'Browse'} ${catName}` : catName}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <motion.div key={p.id} {...reveal(i)} className="h-full">
                <Link
                  to={`/product/${p.slug}`}
                  className="card-hover group block overflow-hidden h-full bg-white dark:bg-ink-50 rounded-2xl border border-gray-200 dark:border-ink-200 shadow-sm"
                >
                  <div className="relative h-44 overflow-hidden">
                    <ProductImage
                      name={localized(p, 'name', 'name_ar', locale)}
                      icon={p.icon}
                      category={localized(p.category, 'name', 'name_ar', locale)}
                      categoryImageUrl={p.category?.image_url}
                      imageBase64={p.image_base64}
                      imageUrl={p.image_url}
                      className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading text-sm font-semibold text-gray-900 dark:text-ink-900 group-hover:text-green-500 transition-colors line-clamp-2 mb-2">
                      {localized(p, 'name', 'name_ar', locale)}
                    </h3>
                    <p className="text-micro text-gray-500 dark:text-ink-500 line-clamp-2 mb-3">
                      {localized(p, 'description', 'description_ar', locale)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!showChildren && products.length === 0 && (
        <div className="card-pad text-center py-16">
          <p className="text-body text-gray-500 dark:text-ink-500">
            {t('common.noResults') ?? 'No products here yet.'}
          </p>
        </div>
      )}
    </PageTransition>
  );
}
