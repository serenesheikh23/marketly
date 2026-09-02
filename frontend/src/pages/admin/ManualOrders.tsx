import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminOrderApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';

export default function AdminManualOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminOrderApi.pendingManual()
      .then((r) => setOrders(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <PageTransition className="space-y-6">
      <div>
        <p className="eyebrow mb-1">Operations</p>
        <h1 className="text-h1 text-ink-900">Manual orders</h1>
        <p className="text-body text-ink-600 mt-1">Pending requests that need attention.</p>
      </div>

      <div className="space-y-3">
        {orders.length === 0 && !loading && (
          <div className="card-pad text-center py-12">
            <p className="text-body text-ink-500">No pending manual orders.</p>
          </div>
        )}
        {orders.map((order, i) => (
          <motion.div key={order.id}
            className="card-pad space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-body font-semibold text-ink-900">
                  Order #{order.id} — {order.user?.name ?? 'Unknown'}
                </p>
                <p className="text-micro text-ink-500 mt-0.5">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span className={`badge-${order.status}`}>{order.status}</span>
            </div>

            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="bg-ink-100 p-3 rounded-lg">
                  <p className="text-small font-medium text-ink-900">{item.product?.name}</p>
                  {item.payload && (
                    <div className="mt-1 text-micro text-ink-500 flex flex-wrap gap-x-3">
                      {Object.entries(item.payload).map(([k, v]) => (
                        <span key={k}>{k}: <span className="text-ink-700">{String(v)}</span></span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm"
                onClick={() => updateStatus(order.id, 'processing')}>
                Mark Processing
              </Button>
              <Button variant="success" size="sm"
                onClick={() => updateStatus(order.id, 'completed')}>
                Complete
              </Button>
              <Button variant="danger" size="sm"
                onClick={() => updateStatus(order.id, 'rejected')}>
                Reject
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
