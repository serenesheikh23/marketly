import { useEffect, useState } from 'react';
import { adminDashboardApi } from '@/api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardApi.stats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Loading…</div>;

  const s = stats?.stats ?? {};

  const tiles = [
    { label: 'Total Users', value: s.total_users, color: 'text-blue-600' },
    { label: 'Revenue', value: `$${(s.total_revenue ?? 0).toFixed(2)}`, color: 'text-green-600' },
    { label: 'Pending Deposits', value: s.pending_deposits, color: 'text-yellow-600' },
    { label: 'Pending Withdrawals', value: s.pending_withdrawals, color: 'text-orange-600' },
    { label: 'Pending Manual Orders', value: s.pending_manual_orders, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="card text-center">
            <p className="text-sm text-gray-500">{t.label}</p>
            <p className={`text-3xl font-bold ${t.color}`}>{t.value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">#</th>
              <th className="pb-2">User</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recent_orders ?? []).map((o: any) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="py-2">{o.id}</td>
                <td className="py-2">{o.user?.name ?? '—'}</td>
                <td className="py-2 font-medium">${Number(o.total).toFixed(2)}</td>
                <td className="py-2"><span className={`badge-${o.status}`}>{o.status}</span></td>
                <td className="py-2 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
