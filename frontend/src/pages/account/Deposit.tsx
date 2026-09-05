import { useState } from 'react';
import { motion } from 'framer-motion';
import { depositApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('binance_pay');
  const [deposit, setDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await depositApi.create({ amount: parseFloat(amount), method });
      setDeposit(res.data);
      toast.success('Deposit initiated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-h1 text-gray-900 dark:text-ink-900 text-center mb-8">Deposit Funds</h1>

        {!deposit ? (
          <motion.form
            onSubmit={handleSubmit}
            className="card-pad space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <label className="label block text-center mb-2">Amount (USD)</label>
              <div className="relative">
                {/* Changed left-3 to start-3 and pl-7 to ps-10 for RTL safety */}
                <span className="absolute inset-y-0 start-3 flex items-center text-gray-600 dark:text-ink-500 text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  className="input ps-10 text-center"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label block text-center mb-2">Payment Method</label>
              <div className="space-y-2">
                {[
                  { value: 'binance_pay', label: 'Binance Pay' },
                  { value: 'usdt', label: 'USDT (BEP-20)' },
                  { value: 'cash_wallet', label: 'Cash Wallet (Admin Approved)' },
                ].map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-center justify-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      method === m.value
                        ? 'border-accent-500 bg-accent-500/5'
                        : 'border-ink-200 bg-gray-100 dark:bg-ink-100 hover:border-ink-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={m.value}
                      checked={method === m.value}
                      onChange={(e) => setMethod(e.target.value)}
                      className="accent-accent-500"
                    />
                    <span className="text-sm text-gray-800 dark:text-ink-800">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
              Generate Deposit
            </Button>
          </motion.form>
        ) : (
          <motion.div
            className="card-pad space-y-5 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-h3 text-gray-900 dark:text-ink-900">Deposit Details</h2>

            <div className="bg-gray-100 dark:bg-ink-100 rounded-xl p-6 space-y-4">
              {deposit.deposit.qr_code && (
                <div className="text-center">
                  <img
                    src={deposit.deposit.qr_code}
                    alt="Payment QR code"
                    className="w-48 h-48 mx-auto rounded-xl border border-ink-200"
                  />
                </div>
              )}
              {deposit.deposit.wallet_address && (
                <div>
                  <p className="label text-center">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-ink-50 p-2.5 rounded-lg text-micro text-gray-700 dark:text-ink-700 break-all border border-ink-200">
                      {deposit.deposit.wallet_address}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(deposit.deposit.wallet_address)}
                      className="btn-ghost btn-sm shrink-0"
                      aria-label="Copy address"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {deposit.deposit.memo && (
                <div>
                  <p className="label text-center">Memo / Tag</p>
                  <code className="block bg-gray-50 dark:bg-ink-50 p-2.5 rounded-lg text-micro text-gray-700 dark:text-ink-700 break-all border border-ink-200">
                    {deposit.deposit.memo}
                  </code>
                </div>
              )}
              {deposit.deposit.instructions && (
                <p className="text-small text-gray-600 dark:text-ink-500 text-center">{deposit.deposit.instructions}</p>
              )}
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => setDeposit(null)}
            >
              Make Another Deposit
            </Button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}