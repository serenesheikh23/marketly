import { useEffect, useState } from 'react';
import { adminDepositApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminDepositApi.list().then((r) => setDeposits(r.data.data ?? [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const approve = async (id: number) => {
    try {
      await adminDepositApi.approve(id);
      toast.success('Deposit approved.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  const reject = async (id: number) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await adminDepositApi.reject(id, reason);
      toast.success('Deposit rejected.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Deposits</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-3">{d.id}</td>
                <td className="px-4 py-3">{d.user?.name ?? '—'}</td>
                <td className="px-4 py-3 font-medium text-green-600">${Number(d.amount).toFixed(2)}</td>
                <td className="px-4 py-3">{d.method}</td>
                <td className="px-4 py-3"><span className={`badge-${d.status}`}>{d.status}</span></td>
                <td className="px-4 py-3 text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {d.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(d.id)} className="text-xs text-green-600 font-medium">Approve</button>
                      <button onClick={() => reject(d.id)} className="text-xs text-red-600 font-medium">Reject</button>
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
