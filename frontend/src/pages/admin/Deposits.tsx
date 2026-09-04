import { useEffect, useState } from 'react';
import { adminDepositApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';
import { formatPrice } from '@/utils/format';

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

  const hasPending = deposits.some((d) => d.status === 'pending');

  return (
    <PageTransition className="space-y-6">
      <div>
        <p className="eyebrow mb-1">Finance</p>
        <h1 className="text-h1 text-ink-900">Deposits</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                {hasPending && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id}>
                  <td className="font-medium text-ink-900 whitespace-nowrap">#{d.id}</td>
                  <td className="whitespace-nowrap">{d.user?.name ?? '—'}</td>
                  <td className="font-medium tabular-nums text-accent-400 whitespace-nowrap">
                    {formatPrice(d.amount)}
                  </td>
                  <td className="whitespace-nowrap">{d.method}</td>
                  <td><span className={`badge-${d.status}`}>{d.status}</span></td>
                  <td className="text-ink-500 whitespace-nowrap">{new Date(d.created_at).toLocaleDateString()}</td>
                  {hasPending && (
                    <td>
                      {d.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="success" onClick={() => approve(d.id)}>Approve</Button>
                          <Button size="sm" variant="danger" onClick={() => reject(d.id)}>Reject</Button>
                        </div>
                      ) : (
                        <span className="text-micro text-ink-500">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {deposits.length === 0 && !loading && (
                <tr><td colSpan={hasPending ? 7 : 6} className="text-center text-ink-500 py-8">No deposits yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
