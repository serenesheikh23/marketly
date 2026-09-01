import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch, updateBalance } from '@/store';
import { vipApi, transactionApi } from '@/api/client';

export default function Dashboard() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [vip, setVip] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => {
    vipApi.status().then((r) => {
      setVip(r.data);
      dispatch(updateBalance(r.data.balance.toString()));
    }).catch(console.error);
    transactionApi.list().then((r) => setTxns(r.data.data ?? [])).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-3xl font-bold text-primary-600">${Number(user?.balance ?? 0).toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">VIP Level</p>
          <p className="text-xl font-bold">{vip?.label ?? '—'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Withdrawal Limit</p>
          <p className="text-xl font-bold">{vip?.withdrawal_limit > 0 ? `$${vip.withdrawal_limit}` : 'None'}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/deposit" className="btn-primary">Deposit Funds</Link>
          <Link to="/dashboard/withdraw" className="btn-secondary">Withdraw</Link>
          <Link to="/dashboard/vip" className="btn-secondary">VIP Status</Link>
          <Link to="/dashboard/manual-services" className="btn-secondary">Manual Services</Link>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Type</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {txns.slice(0, 10).map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-2 capitalize">{t.type}</td>
                <td className={`py-2 font-medium ${['deposit', 'refund', 'vip_upgrade'].includes(t.type) ? 'text-green-600' : 'text-red-600'}`}>
                  {['deposit', 'refund', 'vip_upgrade'].includes(t.type) ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </td>
                <td className="py-2"><span className={`badge-${t.status}`}>{t.status}</span></td>
                <td className="py-2 text-gray-400">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {txns.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
