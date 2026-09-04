import { useEffect, useState } from 'react';
import { adminWithdrawalApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';
import { formatPrice } from '@/utils/format';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminWithdrawalApi.list()
      .then((r) => setWithdrawals(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <PageTransition className="space-y-6">
      <div>
        <p className="eyebrow mb-1">Finance</p>
        <h1 className="text-h1 text-ink-900">Withdrawals</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td className="font-medium text-ink-900">#{w.id}</td>
                  <td>{w.user?.name ?? '—'}</td>
                  <td className="font-medium tabular-nums text-status-rejected">
                    {formatPrice(w.amount)}
                  </td>
                  <td className="text-ink-500 tabular-nums">{formatPrice(w.fee)}</td>
                  <td>{w.method}</td>
                  <td><span className={`badge-${w.status}`}>{w.status}</span></td>
                  <td className="text-ink-500">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td>
                    {w.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => approve(w.id)}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => reject(w.id)}>Reject</Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && !loading && (
                <tr><td colSpan={8} className="text-center text-ink-500 py-8">No withdrawals yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
