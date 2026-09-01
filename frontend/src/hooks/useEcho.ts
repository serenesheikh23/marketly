import { useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAppSelector, useAppDispatch } from './useAuth';
import { updateBalance } from '@/store';
import toast from 'react-hot-toast';

// Pusher is required by Laravel Echo/Reverb
window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  host: `${import.meta.env.VITE_REVERB_SCHEME || 'http'}://${import.meta.env.VITE_REVERB_HOST || '127.0.0.1'}:${import.meta.env.VITE_REVERB_PORT || '8080'}`,
  key: import.meta.env.VITE_REVERB_APP_KEY,
});

export function useEcho() {
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) return;

    const channel = echo.private(`user.${user.id}`);

    channel.listen('OrderCompleted', (data: { order_id: number; total: number }) => {
      toast.success(`Order #${data.order_id} completed! Total: $${data.total}`);
    });

    channel.listen('OrderCreated', (data: { order_id: number; total: number }) => {
      toast.success(`Order #${data.order_id} placed — pending manual review.`);
    });

    channel.listen('DepositStatusChanged', (data: { transaction_id: number; status: string; amount: number }) => {
      if (data.status === 'approved') {
        toast.success(`Deposit of $${data.amount} approved!`);
      } else if (data.status === 'rejected') {
        toast.error(`Deposit of $${data.amount} rejected.`);
      }
    });

    channel.listen('WithdrawalStatusChanged', (data: { transaction_id: number; status: string; amount: number }) => {
      if (data.status === 'approved') {
        toast.success(`Withdrawal of $${data.amount} approved!`);
      } else if (data.status === 'rejected') {
        toast.error(`Withdrawal of $${data.amount} rejected.`);
      }
    });

    channel.listen('VipChanged', (data: { old_level: string; new_level: string }) => {
      toast.success(`VIP level upgraded to ${data.new_level}!`);
    });

    return () => {
      channel.stopListening('OrderCompleted');
      channel.stopListening('OrderCreated');
      channel.stopListening('DepositStatusChanged');
      channel.stopListening('WithdrawalStatusChanged');
      channel.stopListening('VipChanged');
    };
  }, [user]);
}
