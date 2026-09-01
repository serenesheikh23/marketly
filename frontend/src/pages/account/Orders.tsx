import { useEffect, useState } from 'react';
import { orderApi } from '@/api/client';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.list().then((r) => setOrders(r.data.data ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`badge-${order.status}`}>{order.status}</p>
                  <p className="text-lg font-bold mt-1">${Number(order.total).toFixed(2)}</p>
                </div>
              </div>
              {order.items?.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product?.name ?? 'Product'} × {item.quantity}</span>
                      <span>${(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              {order.notes && <p className="mt-2 text-xs text-gray-500">Note: {order.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
