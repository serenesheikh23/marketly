import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productApi } from '@/api/client';
import { useAppDispatch, addToCart } from '@/store';
import Button from '@/components/Button';
import ProductImage from '@/components/ProductImage';
import { formatPrice } from '@/utils/format';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';
import { localized } from '@/utils/localize';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t, locale } = useI18n();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [payload, setPayload] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) return;
    productApi.show(slug).then((res) => {
      setProduct(res.data.product);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <PageTransition className="text-center py-24">
        <p className="text-h3 text-gray-600 dark:text-ink-600 mb-4">{t('product.productNotFound')}</p>
        <Link to="/" className="btn-accent">{t('product.backToHome')}</Link>
      </PageTransition>
    );
  }

  const isManual = product.type === 'manual';

  const handleAddToCart = () => {
    if (!quantity || quantity < 1) {
      setErrors({ quantity: t('product.errorQuantity') });
      return;
    }

    if (isManual) {
      const newErrors: Record<string, string> = {};
      const linkValue = (payload[t('product.linkUsername')] ?? '').trim();
      if (!linkValue) {
        newErrors[t('product.linkUsername')] = t('product.errorLink');
      }
      const qtyValue = (payload[t('product.quantity')] ?? '').trim();
      const qtyNum = parseInt(qtyValue, 10);
      if (!qtyValue || isNaN(qtyNum) || qtyNum < 1) {
        newErrors[t('product.quantity')] = t('product.errorQuantity');
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    } else {
      setErrors({});
    }

    dispatch(
      addToCart({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: isManual
          ? Math.max(1, parseInt((payload[t('product.quantity')] ?? '1').trim(), 10) || 1)
          : quantity,
        payload: isManual ? payload : undefined,
      }),
    );
    navigate('/cart');
  };

  const manualFields = [
    t('product.linkUsername'),
    t('product.quantity'),
    t('product.notesOptional'),
  ];

  return (
    <PageTransition className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[
          { label: t('nav.home'), link: '/' },
          { label: localized(product.category, 'name', 'name_ar', locale), link: `/category/${product.category?.slug}` },
          { label: localized(product, 'name', 'name_ar', locale) },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductImage
            name={localized(product, 'name', 'name_ar', locale)}
            category={localized(product.category, 'name', 'name_ar', locale)}
            imageBase64={product.image_base64}
            imageUrl={product.image_url}
            className="w-full h-80 rounded-2xl"
          />
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.external_store_id && (
                <span className="badge-neutral">{t('product.externalStore')}</span>
              )}
              <span className={`badge ${isManual ? 'badge-pending' : 'badge-completed'}`}>
                {isManual ? t('product.manualService') : t('product.autoDelivery')}
              </span>
            </div>
            <h1 className="text-h1 text-gray-900 dark:text-ink-900 mb-2">{localized(product, 'name', 'name_ar', locale)}</h1>
            <div className="text-small text-gray-600 dark:text-ink-500">
              <span>{t('product.category')}: <Link to={`/category/${product.category?.slug}`} className="text-accent-400 hover:underline">{localized(product.category, 'name', 'name_ar', locale)}</Link></span>
              <span className="mx-2">·</span>
              <span>{t('product.inStock')}: <strong className="text-gray-700 dark:text-ink-700">{product.stock}</strong></span>
            </div>
          </div>

          <p className="text-body text-gray-600 dark:text-ink-600 whitespace-pre-line leading-relaxed">
            {localized(product, 'description', 'description_ar', locale)}
          </p>

          <div className="card-pad space-y-5">
            <div className="flex items-baseline gap-3">
              <span className="text-display-1 text-accent-400 font-bold">
                {formatPrice(product.price)}
              </span>
              <span className="text-body text-gray-600 dark:text-ink-500">{t('product.perUnit')}</span>
            </div>

            {!isManual && (
              <div>
                <label className="label">{t('product.quantity')}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="btn-secondary btn-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    className="input w-20 text-center"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                  />
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="btn-secondary btn-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {isManual && (
              <div className="space-y-3">
                <p className="text-micro text-gray-600 dark:text-ink-500 uppercase tracking-wide">
                  {t('product.serviceDetails')}
                </p>
                {manualFields.map((label) => (
                  <div key={label}>
                    <label className="label">{label}</label>
                    <input
                      className={`input ${errors[label] ? 'border-status-rejected' : ''}`}
                      placeholder={label}
                      value={payload[label] ?? ''}
                      onChange={(e) => {
                        setPayload((p) => ({ ...p, [label]: e.target.value }));
                        setErrors((prev) => ({ ...prev, [label]: '' }));
                      }}
                    />
                    {errors[label] && (
                      <p className="text-micro text-status-rejected mt-1">{errors[label]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-body text-gray-600 dark:text-ink-600">
                {t('product.total')}:{' '}
                <strong className="text-gray-900 dark:text-ink-900">
                  {formatPrice(Number(product.price) * quantity)}
                </strong>
              </span>
              <Button
                variant="accent"
                size="lg"
                onClick={handleAddToCart}
              >
                {t('product.addToCart')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
