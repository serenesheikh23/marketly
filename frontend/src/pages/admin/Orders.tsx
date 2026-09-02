import { useEffect, useState } from 'react';
import { adminOrderApi } from '@/api/client';
import PageTransition from '@/components/PageTransition';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminOrderApi.list()
      .then((r) => setOrders(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition className="space-y-6">
      <div>
        <p className="eyebrow mb-1">Operations</p>
        <h1 className="text-h1 text-ink-900">All orders</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium text-ink-900">#{o.id}</td>
                  <td>{o.user?.name ?? '—'}</td>
                  <td className="tabular-nums">${Number(o.total).toFixed(2)}</td>
                  <td><span className={`badge-${o.status}`}>{o.status}</span></td>
                  <td className="text-ink-500">{o.payment_method}</td>
                  <td className="text-ink-500">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr><td colSpan={6} className="text-center text-ink-500 py-8">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
