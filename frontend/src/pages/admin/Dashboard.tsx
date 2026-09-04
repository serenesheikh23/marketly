import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { adminDashboardApi } from '@/api/client';
import PageTransition from '@/components/PageTransition';
import { formatPrice } from '@/utils/format';

const TILE_COLORS: Record<string, string> = {
  'Total Users':           'text-ink-900',
  'Revenue':               'text-accent-400',
  'Pending Deposits':      'text-status-pending',
  'Pending Withdrawals':   'text-status-processing',
  'Pending Manual Orders': 'text-status-vip',
};

interface HealthCheck {
  status: 'ok' | 'warn' | 'error';
  message: string;
}

function StatusDot({ status }: { status: HealthCheck['status'] }): ReactNode {
  const color = {
    ok: 'bg-accent-500',
    warn: 'bg-status-pending',
    error: 'bg-status-rejected',
  }[status];
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${color} ${status === 'ok' ? 'animate-pulse' : ''}`}
      aria-label={status}
    />
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminDashboardApi.stats(),
      adminDashboardApi.health().catch(() => null),
    ])
      .then(([statsRes, healthRes]) => {
        setStats(statsRes.data);
        if (healthRes) setHealth(healthRes.data);
      })
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
    { label: 'Revenue',               value: formatPrice(s.total_revenue ?? 0), numeric: false },
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

      {/* System Health card */}
      <div className="card-pad">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-h3 text-ink-900">System Health</h2>
            <p className="text-micro text-ink-500 mt-0.5">
              Live infrastructure status · {health?.app_env ?? 'unknown'} · DEBUG:{' '}
              <span className={health?.app_debug ? 'text-status-rejected' : 'text-accent-400'}>
                {String(health?.app_debug ?? '—')}
              </span>
            </p>
          </div>
          {health && (
            <span
              className={`badge-${health.healthy ? 'completed' : 'rejected'}`}
            >
              {health.healthy ? 'All systems normal' : 'Issues detected'}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['database', 'storage', 'reverb'] as const).map((key) => {
            const check: HealthCheck = health?.checks?.[key] ?? { status: 'warn', message: 'Not yet checked' };
            const labels: Record<string, string> = {
              database: 'Database',
              storage: 'Storage',
              reverb: 'Reverb (WebSockets)',
            };
            return (
              <div
                key={key}
                className="flex items-start gap-3 p-3 rounded-lg bg-ink-100/40 border border-ink-200"
              >
                <StatusDot status={check.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-small font-medium text-ink-900">{labels[key]}</p>
                  <p className="text-micro text-ink-500 truncate" title={check.message}>
                    {check.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-pad">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-h3 text-ink-900">Recent orders</h2>
        </div>
        <div className="table-wrap">
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
                  <td className="font-medium text-ink-900 whitespace-nowrap">#{o.id}</td>
                  <td className="whitespace-nowrap">{o.user?.name ?? '—'}</td>
                  <td className="tabular-nums whitespace-nowrap">{formatPrice(o.total)}</td>
                  <td><span className={`badge-${o.status}`}>{o.status}</span></td>
                  <td className="text-ink-500 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {(stats?.recent_orders ?? []).length === 0 && (
                <tr><td colSpan={5} className="text-center text-ink-500 py-6">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
