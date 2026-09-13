import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { transactionApi } from '@/api/client';
import { useAppSelector } from '@/store';
import PageTransition from '@/components/PageTransition';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatPrice } from '@/utils/format';

export default function Wallet() {
  const user = useAppSelector((s) => s.auth.user);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi.list()
      .then((res) => setTransactions(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition className="max-w-3xl mx-auto space-y-8">
      <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'Wallet' }]} />
      <h1 className="text-h1 text-gray-900 dark:text-ink-900">Wallet</h1>

      <div className="card-pad">
        <p className="text-micro text-gray-600 dark:text-ink-500 uppercase tracking-wider mb-2">Balance</p>
        <p className="text-display-1 text-green-500 font-bold tabular-nums">
          {formatPrice(user?.balance)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/dashboard/deposit" className="btn-accent text-center">Deposit</Link>
        <Link to="/dashboard/withdraw" className="btn-secondary text-center">Withdraw</Link>
      </div>

      <div>
        <h2 className="text-h3 text-gray-900 dark:text-ink-900 mb-4">Transactions</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-6 h-6 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-body text-gray-600 dark:text-ink-600">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="card-pad flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-ink-900 capitalize">{tx.type}</p>
                  <p className="text-micro text-gray-500 dark:text-ink-500">{tx.created_at}</p>
                </div>
                <div className="text-end">
                  <p className={`font-bold tabular-nums ${['deposit', 'refund', 'store_earning'].includes(tx.type) ? 'text-green-500' : 'text-status-rejected'}`}>
                    {['deposit', 'refund', 'store_earning'].includes(tx.type) ? '+' : '−'}{formatPrice(tx.amount)}
                  </p>
                  <p className="text-micro text-gray-500 dark:text-ink-500 capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
