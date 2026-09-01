import { useEffect, useState } from 'react';
import { adminOrderApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminManualOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminOrderApi.pendingManual().then((r) => setOrders(r.data.data ?? [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      await adminOrderApi.updateStatus(id, { status, notes });
      toast.success(`Order #${id} marked as ${status}.`);
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Manual Orders</h1>

      <div className="space-y-3">
        {orders.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-8">No pending manual orders.</p>
        )}
        {orders.map((order) => (
          <div key={order.id} className="card space-y-3">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">Order #{order.id} — {order.user?.name}</p>
                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <span className={`badge-${order.status}`}>{order.status}</span>
            </div>
            <div className="text-sm space-y-1">
              {order.items?.map((item: any) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">{item.product?.name}</p>
                  {item.payload && (
                    <div className="mt-1 text-xs text-gray-600">
                      {Object.entries(item.payload).map(([k, v]) => <span key={k} className="mr-3">{k}: {String(v)}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(order.id, 'processing')} className="btn-secondary text-sm">Mark Processing</button>
              <button onClick={() => updateStatus(order.id, 'completed')} className="btn-success text-sm">Complete</button>
              <button onClick={() => updateStatus(order.id, 'rejected')} className="btn-danger text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
