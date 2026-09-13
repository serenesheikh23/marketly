import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/api/client';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';

interface OranosBalance {
  ok: boolean;
  balance: number;
  email: string | null;
  two_factor: boolean;
  level: 'healthy' | 'watch' | 'low' | 'critical';
  checked_at: string;
  message?: string;
}

const LEVEL_META = {
  healthy:  { label: 'سليم',    color: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  emoji: '🟢' },
  watch:    { label: 'مراقبة',  color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', emoji: '🟡' },
  low:      { label: 'منخفض',   color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', emoji: '🟠' },
  critical: { label: 'حرج',     color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    emoji: '🔴' },
};

export default function Oranos() {
  const { t } = useI18n();
  const [data, setData] = useState<OranosBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    try {
      const res = force
        ? await api.post('/admin/oranos/refresh')
        : await api.get('/admin/oranos/balance');
      setData(res.data);
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Could not load Oranos balance';
      setData({
        ok: false,
        balance: 0,
        email: null,
        two_factor: false,
        level: 'critical',
        checked_at: new Date().toISOString(),
        message,
      });
      if (force) toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const meta = LEVEL_META[data.level];
  const checkedAt = new Date(data.checked_at).toLocaleString();

  return (
    <PageTransition className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-h2 font-heading font-bold text-gray-900 dark:text-ink-900 mb-1">
          Oranos Monitor
        </h1>
        <p className="text-body text-gray-600 dark:text-ink-600">
          راقب رصيد حسابك في Oranos Market — الفلوس الحقيقية اللي تُدفع للمورد.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card-pad border-2 ${meta.border} ${meta.bg}`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-micro text-gray-600 dark:text-ink-500 uppercase tracking-wider mb-2">
              رصيد Oranos
            </p>
            <p className={`text-display-1 font-heading font-bold tabular-nums ${meta.color}`}>
              ${data.balance.toFixed(2)}
            </p>
          </div>
          <span className={`text-2xl ${meta.color}`} title={meta.label}>{meta.emoji}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color} ${meta.border} border`}>
            {meta.emoji} {meta.label}
          </span>
          {data.email && (
            <span className="text-micro text-gray-500 dark:text-ink-500">
              الحساب: {data.email}
            </span>
          )}
          {data.two_factor && (
            <span className="text-micro text-gray-500 dark:text-ink-500">
              🔐 2FA مفعّل
            </span>
          )}
        </div>

        <p className="text-micro text-gray-500 dark:text-ink-500 mt-4">
          آخر فحص: {checkedAt}
        </p>

        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-gray-200 dark:border-ink-200">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary btn-sm disabled:opacity-50"
          >
            {refreshing ? 'جاري الفحص...' : '🔄 إعادة الفحص'}
          </button>
          <a
            href="https://oranosmarket.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent btn-sm"
          >
            فتح Oranos Market ↗
          </a>
        </div>
      </motion.div>

      {data.message && (
        <div className="card-pad border border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-500 font-medium mb-1">⚠️ تعذّر الاتصال بـ Oranos</p>
          <p className="text-micro text-gray-600 dark:text-ink-600">{data.message}</p>
        </div>
      )}

      <div className="card-pad space-y-4">
        <h2 className="text-h3 font-heading font-semibold text-gray-900 dark:text-ink-900">
          ℹ️ كيف يشتغل هذا الرصيد
        </h2>

        <div className="space-y-3 text-body text-gray-700 dark:text-ink-700">
          <p>
            <strong>رصيد Oranos</strong> = الفلوس الحقيقية اللي عندك في حساب Oranos.
            لما أي عميل يشتري من موقعك، الخادم يدفع من هذا الرصيد للمورد.
          </p>
          <p>
            <strong>رصيد Marketly</strong> (اللي يظهر في الهيدر) = فلوس عملائك داخل موقعك.
            منفصل تماماً، ما له علاقة بـ Oranos.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { level: 'healthy',  range: '≥ $50',     desc: 'كل شي تمام' },
            { level: 'watch',    range: '$20 – $50', desc: 'راقب الوضع' },
            { level: 'low',      range: '$10 – $20', desc: 'وقت التعبئة' },
            { level: 'critical', range: '< $10',     desc: 'توقف الخدمة محتمل' },
          ].map((row) => {
            const m = LEVEL_META[row.level as keyof typeof LEVEL_META];
            return (
              <div key={row.level} className={`flex items-center justify-between p-3 rounded-lg border ${m.border} ${m.bg}`}>
                <div>
                  <p className={`text-sm font-semibold ${m.color}`}>{m.emoji} {m.label}</p>
                  <p className="text-micro text-gray-600 dark:text-ink-500">{row.desc}</p>
                </div>
                <span className="text-sm text-gray-700 dark:text-ink-700 font-mono">{row.range}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 dark:border-ink-200 pt-4 mt-4">
          <p className="text-micro text-gray-500 dark:text-ink-500">
            <strong>نصيحة:</strong> افتح هذه الصفحة كل صباح. لو الرصيد أقل من $20، سجّل دخول
            إلى oranosmarket.com وعبّيه قبل ما يوقف العمل عن العملاء.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
