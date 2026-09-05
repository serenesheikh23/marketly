import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store';
import { depositApi } from '@/api/client';
import toast from 'react-hot-toast';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';

export default function Deposit() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useAppSelector((s) => s.auth.user);
  const [amount, setAmount] = useState(100);
  const [method, setMethod] = useState('binance_pay');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await depositApi.create({ amount, method });
      toast.success(t('deposit.success'));
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <h1 className="text-h1 text-gray-900 dark:text-ink-900 mb-2">{t('deposit.title')}</h1>
          <p className="text-body text-gray-600 dark:text-ink-500">{t('deposit.subtitle')}</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="card-pad space-y-6"
        >
          <div>
            <label htmlFor="amount" className="label block text-center mb-2">{t('deposit.amount')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 start-3 flex items-center text-gray-500 dark:text-ink-500">
                $
              </span>
              <input
                id="amount"
                type="number"
                min="1"
                required
                className="input ps-10 text-center"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="label block text-center mb-2">{t('deposit.method')}</label>
            <div className="space-y-3">
              {[
                { id: 'binance_pay', label: t('deposit.binance') },
                { id: 'usdt', label: t('deposit.usdt') },
                { id: 'cash_wallet', label: t('deposit.wallet') },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id)}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    method === opt.id
                      ? 'border-accent-500 bg-accent-500/10 text-accent-500'
                      : 'border-gray-200 dark:border-ink-200 hover:border-accent-500/50'
                  }`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span
                    className={`w-4 h-4 rounded-full border-2 ${
                      method === opt.id ? 'border-accent-500 bg-accent-500' : 'border-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full"
          >
            {loading ? t('common.processing') : t('deposit.submit')}
          </button>
        </motion.form>
      </div>
    </PageTransition>
  );
}