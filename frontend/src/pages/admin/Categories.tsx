import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminCategoryApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', type: 'auto', description: '', icon: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    adminCategoryApi.list()
      .then((r) => setCategories(r.data.categories ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
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
    <PageTransition className="space-y-8">
      <div>
        <p className="eyebrow mb-1">Taxonomy</p>
        <h1 className="text-h1 text-ink-900">Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleCreate} className="card-pad space-y-4">
          <h2 className="text-h3 text-ink-900">New category</h2>
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="e.g. Streaming Accounts" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="auto">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} placeholder="Optional" value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Icon key</label>
            <input className="input" placeholder="gamepad, wallet, monitor…" value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} />
          </div>
          <Button type="submit" variant="accent" className="w-full" loading={saving}>
            Create
          </Button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {categories.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="card-pad flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-ink-900">{c.name}</p>
                <p className="text-micro text-ink-500 mt-0.5">
                  {c.slug} · <span className="text-ink-600">{c.type}</span>
                </p>
              </div>
              <button
                onClick={() => deleteCat(c.id)}
                className="text-small font-medium text-status-rejected hover:text-status-rejected/80"
              >
                Delete
              </button>
            </motion.div>
          ))}
          {categories.length === 0 && !loading && (
            <p className="text-center text-ink-500 py-8">No categories yet.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
