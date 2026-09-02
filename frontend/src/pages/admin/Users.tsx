import { useEffect, useState } from 'react';
import { adminUserApi } from '@/api/client';
import toast from 'react-hot-toast';
import PageTransition from '@/components/PageTransition';
import { formatPrice } from '@/utils/format';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    adminUserApi.list(search ? { search } : {})
      .then((r) => setUsers(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const toggleBan = async (user: any) => {
    try {
      await adminUserApi.update(user.id, { banned: !user.banned_at });
      toast.success(user.banned_at ? 'User unbanned.' : 'User banned.');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    }
  };

  const changeVip = async (user: any, level: string) => {
    try {
      await adminUserApi.update(user.id, { vip_level: level });
      toast.success(`VIP updated to ${level}.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-1">Users</p>
          <h1 className="text-h1 text-ink-900">All users</h1>
        </div>
        <div className="relative w-72 max-w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            placeholder="Search users…"
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>VIP</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-ink-900">{u.name}</td>
                  <td className="text-ink-500">{u.email}</td>
                  <td>
                    <select
                      className="input py-1 text-xs w-28"
                      value={u.vip_level}
                      onChange={(e) => changeVip(u, e.target.value)}
                    >
                      <option value="none">Regular</option>
                      <option value="vip1">VIP1</option>
                      <option value="vip2">VIP2</option>
                    </select>
                  </td>
                  <td className="font-medium tabular-nums">{formatPrice(u.balance)}</td>
                  <td>
                    {u.banned_at
                      ? <span className="badge-rejected">Banned</span>
                      : <span className="badge-completed">Active</span>}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleBan(u)}
                      className={`text-small font-medium ${
                        u.banned_at
                          ? 'text-accent-400 hover:text-accent-300'
                          : 'text-status-rejected hover:text-status-rejected/80'
                      }`}
                    >
                      {u.banned_at ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan={6} className="text-center text-ink-500 py-8">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
