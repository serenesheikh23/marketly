import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, updateQuantity, removeFromCart, clearCart } from '@/store';
import { orderApi, depositApi, withdrawalApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items } = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash_wallet');
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await orderApi.create({
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          payload: i.payload,
        })),
        payment_method: paymentMethod,
      });
      toast.success(`Order #${res.data.order.id} placed!`);
      dispatch(clearCart());
      navigate('/dashboard/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <a href="/" className="btn-primary">Browse Products</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        {items.map((item) => (
          <div key={item.product_id} className="card flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              {item.payload && (
                <p className="text-xs text-gray-500 mt-1">
                  {Object.entries(item.payload).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                </p>
              )}
            </div>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => dispatch(updateQuantity({ product_id: item.product_id, quantity: parseInt(e.target.value) || 1 }))}
              className="input w-20"
            />
            <div className="text-lg font-bold text-primary-600 w-24 text-right">${(item.price * item.quantity).toFixed(2)}</div>
            <button onClick={() => dispatch(removeFromCart(item.product_id))} className="text-red-500 text-sm">Remove</button>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Checkout</h2>
        <div className="space-y-3 mb-6">
          {[
            { value: 'cash_wallet', label: 'Cash Wallet' },
            { value: 'binance_pay', label: 'Binance Pay' },
            { value: 'usdt', label: 'USDT (BEP-20)' },
          ].map((m) => (
            <label key={m.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="payment_method"
                value={m.value}
                checked={paymentMethod === m.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              {m.label}
            </label>
          ))}
        </div>
        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? 'Processing…' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
