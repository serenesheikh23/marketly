import { useState } from 'react';
import { depositApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('binance_pay');
  const [deposit, setDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await depositApi.create({ amount: parseFloat(amount), method });
      setDeposit(res.data);
      toast.success('Deposit initiated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Deposit Funds</h1>

      {!deposit ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Amount (USD)</label>
            <input type="number" min="1" step="0.01" required className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100.00" />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="binance_pay">Binance Pay</option>
              <option value="usdt">USDT (BEP-20)</option>
              <option value="cash_wallet">Cash Wallet (Admin Approved)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Generating…' : 'Generate Deposit'}
          </button>
        </form>
      ) : (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold">Deposit Details</h2>
          <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
            {deposit.deposit.qr_code && (
              <div className="text-center">
                <img src={deposit.deposit.qr_code} alt="QR Code" className="mx-auto w-48 h-48" />
              </div>
            )}
            {deposit.deposit.wallet_address && (
              <div>
                <p className="text-gray-500">Wallet Address</p>
                <code className="block bg-white p-2 rounded border break-all">{deposit.deposit.wallet_address}</code>
              </div>
            )}
            {deposit.deposit.memo && (
              <div>
                <p className="text-gray-500">Memo</p>
                <code className="block bg-white p-2 rounded border">{deposit.deposit.memo}</code>
              </div>
            )}
            <p className="text-gray-600 text-center">{deposit.deposit.instructions}</p>
          </div>
          <button onClick={() => setDeposit(null)} className="btn-secondary w-full">Make Another Deposit</button>
        </div>
      )}
    </div>
  );
}
