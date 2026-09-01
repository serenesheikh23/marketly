import { useEffect, useState } from 'react';
import { adminWithdrawalApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminWithdrawalApi.list().then((r) => setWithdrawals(r.data.data ?? [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (id: number) => {
    try {
      await adminWithdrawalApi.approve(id);
      toast.success('Withdrawal approved.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  const reject = async (id: number) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await adminWithdrawalApi.reject(id, reason);
      toast.success('Withdrawal rejected.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-4 py-3">{w.id}</td>
                <td className="px-4 py-3">{w.user?.name ?? '—'}</td>
                <td className="px-4 py-3 font-medium text-red-600">${Number(w.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500">${Number(w.fee).toFixed(2)}</td>
                <td className="px-4 py-3">{w.method}</td>
                <td className="px-4 py-3"><span className={`badge-${w.status}`}>{w.status}</span></td>
                <td className="px-4 py-3 text-gray-400">{new Date(w.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(w.id)} className="text-xs text-green-600 font-medium">Approve</button>
                      <button onClick={() => reject(w.id)} className="text-xs text-red-600 font-medium">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
