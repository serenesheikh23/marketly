import { useEffect, useState } from 'react';
import { adminCategoryApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', type: 'auto', description: '', icon: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    adminCategoryApi.list().then((r) => setCategories(r.data.categories ?? [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCategoryApi.create(form);
      toast.success('Category created.');
      setForm({ name: '', type: 'auto', description: '', icon: '' });
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteCat = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await adminCategoryApi.delete(id);
      toast.success('Deleted.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      <form onSubmit={handleCreate} className="card max-w-lg space-y-4">
        <h2 className="font-bold">New Category</h2>
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <select className="input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
          <option value="auto">Automatic</option>
          <option value="manual">Manual</option>
        </select>
        <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Create'}</button>
      </form>

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-gray-500">{c.slug} • {c.type}</p>
            </div>
            <button onClick={() => deleteCat(c.id)} className="text-xs text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
