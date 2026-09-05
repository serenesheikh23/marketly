import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { categoryApi, orderApi, productApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';
import { localized } from '@/utils/localize';

const CATEGORY_ICON: Record<string, string> = {
  gamepad: '🎮', message: '💬', 'credit-card': '💳', wallet: '💰',
  design: '🎨', monitor: '📺', server: '🛡️', 'check-circle': '✅',
  cpu: '🤖', handshake: '🤝', share: '🔗',
};

export default function ManualServices() {
  const { locale, t } = useI18n();
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryApi.list()
      .then((r) => setCategories((r.data.categories ?? []).filter((c: any) => c.type === 'manual')))
      .catch(console.error);
  }, []);

  const selectCategory = async (cat: any) => {
    setSelected(cat);
    try {
      const r = await categoryApi.formSchema(cat.slug);
      setFields(r.data.fields ?? []);
    } catch {
      setFields([]);
    }
    // Also fetch products for this category so the order can reference one
    try {
      const pr = await productApi.list({ category_id: cat.id, type: 'manual' });
      // attach products to selected for later use
      setSelected((prev: any) => ({ ...(prev ?? cat), products: pr.data.data ?? pr.data.products ?? [] }));
    } catch {
      // keep products on cat if any
    }
    setFormData({});
    setQuantity(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const products = (selected.products ?? []).filter((p: any) => p.type === 'manual');
      if (products.length === 0) { toast.error(t('manualServices.noProducts')); return; }
      await orderApi.create({
        items: [{ product_id: products[0].id, quantity, payload: formData }],
        payment_method: 'cash_wallet',
      });
      toast.success(t('manualServices.success'));
      setSelected(null);
      setFormData({});
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('manualServices.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      <PageTransition className="space-y-2">
        <p className="eyebrow mb-2">{t('manualServices.title')}</p>
        <h1 className="text-h1 text-gray-900 dark:text-ink-900">{t('manualServices.title')}</h1>
        <p className="text-body text-gray-600 dark:text-ink-600 mt-2">
          {t('manualServices.description')}
        </p>
      </PageTransition>

      {!selected ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}>
              <button
                onClick={() => selectCategory(cat)}
                className="card-hover text-left w-full p-5"
              >
                <span className="text-2xl mb-3 block" role="img">
                  {CATEGORY_ICON[cat.icon] ?? '📦'}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-ink-900">{localized(cat, 'name', 'name_ar', locale)}</h3>
                <p className="text-micro text-gray-600 dark:text-ink-500 mt-1 line-clamp-2">{localized(cat, 'description', 'description_ar', locale)}</p>
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <button
            onClick={() => setSelected(null)}
            className="nav-link text-sm self-start mb-2"
          >
            {t('manualServices.backToCategories')}
          </button>

          <div className="card-pad max-w-xl mx-auto w-full flex flex-col items-center space-y-5">
            <div>
              <p className="eyebrow mb-1">{localized(selected, 'name', 'name_ar', locale)}</p>
              <h2 className="text-h2 text-gray-900 dark:text-ink-900">{t('manualServices.serviceDetails')}</h2>
              {selected.description && (
                <p className="text-body text-gray-600 dark:text-ink-600 mt-2">{localized(selected, 'description', 'description_ar', locale)}</p>
              )}
            </div>

            {fields.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((f: any) => (
                  <div key={f.key}>
                    <label className="label">
                      {f.label}{f.required ? ' *' : ''}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        className="input"
                        rows={3}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={formData[f.key] ?? ''}
                        onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                      />
                    ) : f.type === 'select' ? (
                      <select
                        className="input"
                        required={f.required}
                        value={formData[f.key] ?? ''}
                        onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                      >
                        <option value="">{t('manualServices.select')}</option>
                        {(f.options ?? []).map((o: string) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === 'number' ? 'number' : 'text'}
                        className="input"
                        required={f.required}
                        placeholder={f.placeholder}
                        value={formData[f.key] ?? ''}
                        onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                <div>
                  <label className="label">{t('manualServices.quantity')}</label>
                  <input
                    type="number"
                    min="1"
                    className="input w-32"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  loading={submitting}
                  className="w-full"
                >
                  {t('manualServices.submit')}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-3xl">📋</p>
                <p className="text-body text-gray-600 dark:text-ink-500">{t('manualServices.noFields')}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
