import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminDashboardApi } from '@/api/client';
import PageTransition from '@/components/PageTransition';

const TILE_COLORS: Record<string, string> = {
  'Total Users':           'text-ink-900',
  'Revenue':               'text-accent-400',
  'Pending Deposits':      'text-status-pending',
  'Pending Withdrawals':   'text-status-processing',
  'Pending Manual Orders': 'text-status-vip',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardApi.stats()
      .then((r) => setStats(r.data))
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

  const s = stats?.stats ?? {};

  const tiles = [
    { label: 'Total Users',           value: s.total_users,            numeric: true },
    { label: 'Revenue',               value: `$${(s.total_revenue ?? 0).toFixed(2)}`, numeric: false },
    { label: 'Pending Deposits',      value: s.pending_deposits,        numeric: true },
    { label: 'Pending Withdrawals',   value: s.pending_withdrawals,     numeric: true },
    { label: 'Pending Manual Orders', value: s.pending_manual_orders,   numeric: true },
  ];

  return (
    <PageTransition className="space-y-8">
      <div>
        <p className="eyebrow mb-1">Overview</p>
        <h1 className="text-h1 text-ink-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="card-pad"
          >
            <p className="text-micro text-ink-500 uppercase tracking-wide">{t.label}</p>
            <p className={`text-h2 tabular-nums ${TILE_COLORS[t.label] ?? 'text-ink-900'}`}>
              {t.value ?? '—'}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="card-pad">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-h3 text-ink-900">Recent orders</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recent_orders ?? []).map((o: any) => (
              <tr key={o.id}>
                <td className="font-medium text-ink-900">#{o.id}</td>
                <td>{o.user?.name ?? '—'}</td>
                <td className="tabular-nums">${Number(o.total).toFixed(2)}</td>
                <td><span className={`badge-${o.status}`}>{o.status}</span></td>
                <td className="text-ink-500">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(stats?.recent_orders ?? []).length === 0 && (
              <tr><td colSpan={5} className="text-center text-ink-500 py-6">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PageTransition>
  );
}
