import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch, updateQuantity, removeFromCart, clearCart } from '@/store';
import { orderApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import PageTransition from '@/components/PageTransition';
import { formatPrice } from '@/utils/format';

const PAYMENT_METHODS = [
  { value: 'cash_wallet', label: 'Cash Wallet' },
  { value: 'binance_pay', label: 'Binance Pay' },
  { value: 'usdt', label: 'USDT (BEP-20)' },
];

export default function Cart() {
  const { items } = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash_wallet');
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleConfirm = () => {
    if (items.length === 0) return;
    setConfirming(true);
  };

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
      <PageTransition>
        <EmptyState
          icon={
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="Your cart is empty"
          description="You haven't added any products yet. Browse our catalog to find game keys, subscriptions, and more."
          action={{ label: 'Browse products', to: '/products' }}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <h1 className="text-h1 text-ink-900 mb-8">Your cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.product_id}
              className="card-pad flex items-center gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-ink-900 truncate">{item.name}</h3>
                {item.payload && (
                  <p className="text-micro text-ink-500 mt-0.5 truncate">
                    {Object.entries(item.payload).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    dispatch(updateQuantity({ product_id: item.product_id, quantity: Math.max(1, item.quantity - 1) }))
                  }
                  className="btn-secondary btn-sm w-7 h-7 p-0 flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-sm font-medium text-ink-900 w-6 text-center tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    dispatch(updateQuantity({ product_id: item.product_id, quantity: item.quantity + 1 }))
                  }
                  className="btn-secondary btn-sm w-7 h-7 p-0 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              <span className="text-h3 text-accent-400 w-24 text-right tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </span>

              <button
                onClick={() => dispatch(removeFromCart(item.product_id))}
                className="btn-ghost btn-sm text-status-rejected/70 hover:text-status-rejected p-1.5"
                aria-label="Remove"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card-pad sticky top-24 space-y-5">
            <h2 className="text-h3 text-ink-900">Checkout</h2>

            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                    paymentMethod === m.value
                      ? 'border-accent-500 bg-accent-500/5'
                      : 'border-ink-200 bg-ink-100 hover:border-ink-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-accent-500"
                  />
                  <span className="text-sm text-ink-800">{m.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-ink-200 pt-4 space-y-1">
              <div className="flex justify-between text-small text-ink-500">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-body text-ink-600">
                <span>Total</span>
                <span className="text-h3 text-accent-400">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Demo payment notice — visible until real API keys are added */}
            <div
              role="note"
              aria-live="polite"
              className="flex items-start gap-2 p-3 rounded-lg bg-status-pending/10 border border-status-pending/30 text-status-pending text-small"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                <strong className="font-semibold">Demo mode:</strong> payment is
                currently a mock — orders will not be charged until real
                payment keys are configured.
              </span>
            </div>

            {confirming ? (
              <div className="space-y-3">
                <div className="card-pad bg-ink-100/40 p-4 space-y-1 text-small">
                  <p className="text-ink-700">
                    <strong className="text-ink-900">{items.length}</strong> item
                    {items.length === 1 ? '' : 's'} for{' '}
                    <strong className="text-accent-400">{formatPrice(total)}</strong>
                  </p>
                  <p className="text-ink-500">
                    Paying with{' '}
                    <strong className="text-ink-700">
                      {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
                    </strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="accent"
                    size="lg"
                    className="flex-1"
                    loading={submitting}
                    onClick={handleCheckout}
                  >
                    Confirm order
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setConfirming(false)}
                    disabled={submitting}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                onClick={handleConfirm}
              >
                Review &amp; place order
              </Button>
            )}

            <p className="text-micro text-ink-500 text-center">
              Orders are processed instantly after payment confirmation.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
