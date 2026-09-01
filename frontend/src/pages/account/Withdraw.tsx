import { useState, useEffect } from 'react';
import { withdrawalApi, vipApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function Withdraw() {
  const [vip, setVip] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [method, setMethod] = useState('usdt');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    vipApi.status().then((r) => setVip(r.data)).catch(console.error);
  }, []);

  const amountNum = parseFloat(amount) || 0;
  const feePct = vip?.fee_percent ?? 5;
  const fee = amountNum * (feePct / 100);
  const net = amountNum - fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await withdrawalApi.create({ amount: amountNum, wallet_address: wallet, method });
      toast.success('Withdrawal request submitted!');
      setAmount('');
      setWallet('');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Your VIP Level</p>
          <p className="text-xl font-bold">{vip?.label ?? '—'}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Withdrawal Limit</p>
          <p className="text-xl font-bold">{vip?.withdrawal_limit > 0 ? `$${vip.withdrawal_limit}` : 'None'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Amount (USD)</label>
          <input type="number" min="1" step="0.01" required className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {amountNum > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Fee ({feePct}%): <span className="text-red-500">-${fee.toFixed(2)}</span> — Net: <strong>${net.toFixed(2)}</strong>
            </p>
          )}
        </div>
        <div>
          <label className="label">Wallet / Address</label>
          <input type="text" required className="input" value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="0x..." />
        </div>
        <div>
          <label className="label">Method</label>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="usdt">USDT (BEP-20)</option>
            <option value="binance_pay">Binance Pay</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting…' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  );
}
