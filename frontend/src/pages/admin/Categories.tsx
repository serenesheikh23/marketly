import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminCategoryApi } from '@/api/client';
import toast from 'react-hot-toast';
import CategoryModal from '@/components/CategoryModal';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';

const CATEGORY_ICON: Record<string, string> = {
  'gamepad-2':'🎮','zap':'⚡','shield':'🛡️','globe':'🌐','server':'🖥️',
  'monitor':'🖥️','credit-card':'💳','wallet':'💰','message-circle':'💬',
  'phone':'📞','mail':'📧','user':'👤','users':'👥','star':'⭐','heart':'❤️',
  'shopping-cart':'🛒','bag':'👜','package':'📦','box':'📦','layers':'📚',
  'grid':'⊞','image':'🖼️','camera':'📷','film':'🎬','video':'🎥','music':'🎵',
  'headphones':'🎧','mic':'🎤','bell':'🔔','lock':'🔒','unlock':'🔓','key':'🔑',
  'shield-check':'✅','eye':'👁️','search':'🔍','settings':'⚙️','tool':'🔧',
  'wrench':'🔧','code':'💻','database':'🗄️','cloud':'☁️','download':'⬇️',
  'upload':'⬆️','share':'🔗','link':'🔗','copy':'📋','clipboard':'📋',
  'bookmark':'🔖','tag':'🏷️','flag':'🚩','book':'📖','map':'🗺️',
  'navigation':'🧭','map-pin':'📍','compass':'🧭','send':'📤','inbox':'📥',
  'check-circle':'✅','x-circle':'❌','alert-circle':'⚠️','info':'ℹ️',
  'plus':'➕','minus':'➖','refresh':'🔄','clock':'🕐','calendar':'📅',
  'dollar-sign':'$','trending-up':'📈','trending-down':'📉','pie-chart':'📊',
  'facebook':'📘','twitter':'🐦','instagram':'📷','youtube':'▶️','twitch':'🎮',
  'discord':'💬','telegram':'✈️','bot':'🤖','cpu':'🖥️','smartphone':'📱',
  'gem':'💎','crown':'👑','award':'🏆','gift':'🎁','sparkles':'✨',
  'rocket':'🚀','target':'🎯',
};

export default function AdminCategories() {
  const { locale, t } = useI18n();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any | undefined>(undefined);

  const fetch = () => {
    setLoading(true);
    setError(null);
    adminCategoryApi.list()
      .then((r) => setCategories(r.data.categories ?? []))
      .catch((err: any) => {
        console.error(err);
        setError(err.response?.data?.message ?? t('common.failed'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (cat: any) => {
    if (!confirm(t('admin.categoryDeleteConfirm', { name: cat.name }))) return;
    try {
      await adminCategoryApi.delete(cat.id);
      toast.success(t('admin.categoryDeleted'));
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? t('common.failed')); }
  };

  const openEdit = (cat: any) => { setEditCategory(cat); setShowModal(true); };
  const openNew = () => { setEditCategory(undefined); setShowModal(true); };
  const onSaved = () => { toast.success(editCategory ? t('admin.categoryUpdated') : t('admin.newCategoryCreated')); fetch(); };

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1">{t('admin.system')}</p>
          <h1 className="text-h1 text-gray-900 dark:text-ink-900">{t('admin.categories')}</h1>
        </div>
        <button onClick={openNew} className="btn-accent">
          + {t('admin.newCategory')}
        </button>
      </div>

      {error && (
        <div className="card-pad text-center">
          <p className="text-body text-status-rejected mb-3">{error}</p>
          <button onClick={fetch} className="btn-accent">{t('admin.retry')}</button>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="card-pad flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {(c.image_url ?? c.image_base64) ? (
                <img
                  src={c.image_url ?? c.image_base64}
                  alt={c.name}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-ink-200 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-ink-100 border border-gray-200 dark:border-ink-200 flex items-center justify-center text-xl flex-shrink-0">
                  {CATEGORY_ICON[c.icon] ?? c.icon?.charAt(0).toUpperCase() ?? '📦'}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-ink-900">{locale === 'ar' && c.name_ar ? c.name_ar : c.name}</p>
                <p className="text-micro text-gray-500 dark:text-ink-500">
                  {c.slug} · <span className="text-gray-500 dark:text-ink-600">{c.type}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(c)} className="btn-secondary btn-sm">
                {t('common.edit')}
              </button>
              <button onClick={() => handleDelete(c)} className="btn-danger btn-sm">
                {t('common.delete')}
              </button>
            </div>
          </motion.div>
        ))}
        {categories.length === 0 && !loading && (
          <p className="text-center text-gray-500 dark:text-ink-500 py-8">{t('admin.noCategoriesYet')}</p>
        )}
      </div>

      {showModal && (
        <CategoryModal
          category={editCategory}
          onClose={() => setShowModal(false)}
          onSaved={onSaved}
        />
      )}
    </PageTransition>
  );
}
