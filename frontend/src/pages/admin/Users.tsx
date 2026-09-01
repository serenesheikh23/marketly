import { useEffect, useState } from 'react';
import { adminUserApi } from '@/api/client';
import toast from 'react-hot-toast';

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <input type="search" placeholder="Search users…" className="input w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">VIP</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 font-medium">${Number(u.balance).toFixed(2)}</td>
                <td className="px-4 py-3">
                  {u.banned_at ? <span className="badge-rejected">Banned</span> : <span className="badge-completed">Active</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleBan(u)} className={`text-xs ${u.banned_at ? 'text-green-600' : 'text-red-600'}`}>
                    {u.banned_at ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
