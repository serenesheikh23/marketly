import { useEffect, useState } from 'react';
import { adminOrderApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminOrderApi.list().then((r) => setOrders(r.data.data ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-3">{o.id}</td>
                <td className="px-4 py-3">{o.user?.name ?? '—'}</td>
                <td className="px-4 py-3 font-medium">${Number(o.total).toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`badge-${o.status}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-gray-500">{o.payment_method}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
