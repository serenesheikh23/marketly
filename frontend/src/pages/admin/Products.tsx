import { useEffect, useState } from 'react';
import { adminProductApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminProductApi.list().then((r) => setProducts(r.data.data ?? [])).catch(console.error).finally(() => setLoading(false));
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={fetch} className="btn-secondary text-sm">Refresh</button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`badge ${p.type === 'manual' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{p.type}</span></td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(p)} className={`text-xs ${p.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteProduct(p.id)} className="text-xs text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
