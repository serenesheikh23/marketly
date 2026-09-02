import { useEffect, useState } from 'react';
import { adminProductApi } from '@/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import PageTransition from '@/components/PageTransition';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminProductApi.list()
      .then((r) => setProducts(r.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const toggleActive = async (p: any) => {
    try {
      await adminProductApi.update(p.id, { is_active: !p.is_active });
      toast.success(p.is_active ? 'Product deactivated.' : 'Product activated.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminProductApi.delete(id);
      toast.success('Deleted.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1">Catalog</p>
          <h1 className="text-h1 text-ink-900">Products</h1>
        </div>
        <Button variant="secondary" size="sm" onClick={fetch}>Refresh</Button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Type</th>
                <th>Stock</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-ink-900">{p.name}</td>
                  <td className="text-ink-500">{p.category?.name ?? '—'}</td>
                  <td className="tabular-nums">${Number(p.price).toFixed(2)}</td>
                  <td>
                    <span className={p.type === 'manual' ? 'badge-pending' : 'badge-completed'}>
                      {p.type}
                    </span>
                  </td>
                  <td className="tabular-nums">{p.stock}</td>
                  <td>
                    <button
                      onClick={() => toggleActive(p)}
                      className={`text-small font-medium ${
                        p.is_active
                          ? 'text-accent-400 hover:text-accent-300'
                          : 'text-status-rejected hover:text-status-rejected/80'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="text-small font-medium text-status-rejected hover:text-status-rejected/80"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loading && (
                <tr><td colSpan={7} className="text-center text-ink-500 py-8">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
