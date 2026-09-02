import { useEffect, useState } from 'react';
import { adminDepositApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminDepositApi.list()
      .then((r) => setDeposits(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <PageTransition className="space-y-6">
      <div>
        <p className="eyebrow mb-1">Finance</p>
        <h1 className="text-h1 text-ink-900">Deposits</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id}>
                  <td className="font-medium text-ink-900">#{d.id}</td>
                  <td>{d.user?.name ?? '—'}</td>
                  <td className="font-medium tabular-nums text-accent-400">
                    ${Number(d.amount).toFixed(2)}
                  </td>
                  <td>{d.method}</td>
                  <td><span className={`badge-${d.status}`}>{d.status}</span></td>
                  <td className="text-ink-500">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td>
                    {d.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => approve(d.id)}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => reject(d.id)}>Reject</Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && !loading && (
                <tr><td colSpan={7} className="text-center text-ink-500 py-8">No deposits yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
