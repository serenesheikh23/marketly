import { useEffect, useState } from 'react';
import { adminProductApi } from '@/api/client';
import toast from 'react-hot-toast';
import ProductModal from '@/components/ProductModal';
import { TableSkeleton } from '@/components/Skeleton';
import { formatPrice } from '@/utils/format';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';

export default function AdminProducts() {
  const { locale } = useI18n();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any | undefined>(undefined);

  const fetch = () => {
    setLoading(true);
    setError(null);
    adminProductApi.list()
      .then((r) => setProducts(r.data.data ?? []))
      .catch((err: any) => {
        console.error(err);
        setError(err.response?.data?.message ?? 'Failed to load products.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (p: any) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await adminProductApi.delete(p.id);
      toast.success('Product deleted.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  const toggleActive = async (p: any) => {
    try {
      await adminProductApi.update(p.id, { is_active: !p.is_active });
      toast.success(p.is_active ? 'Product deactivated.' : 'Product activated.');
      fetch();
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
  };

  const openEdit = (p: any) => { setEditProduct(p); setShowModal(true); };
  const openNew = () => { setEditProduct(undefined); setShowModal(true); };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1">Catalog</p>
          <h1 className="text-h1 text-gray-900 dark:text-ink-900">Products</h1>
        </div>
        <button onClick={openNew} className="btn-accent">
          + New Product
        </button>
      </div>

      {error && (
        <div className="card-pad text-center">
          <p className="text-body text-status-rejected mb-3">{error}</p>
          <button onClick={fetch} className="btn-accent">Retry</button>
        </div>
      )}

      {loading && !error && <TableSkeleton rows={6} columns={7} />}

      <div className={`card overflow-hidden p-0 ${loading ? 'hidden' : ''}`}>
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
                  <td className="font-medium text-gray-900 dark:text-ink-900">{locale === 'ar' && p.name_ar ? p.name_ar : p.name}</td>
                  <td className="text-gray-600 dark:text-ink-500">
                    {p.category
                      ? locale === 'ar' && p.category.name_ar
                        ? p.category.name_ar
                        : p.category.name
                      : '—'}
                  </td>
                  <td className="tabular-nums">{formatPrice(p.price)}</td>
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
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="btn-secondary btn-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-600 dark:text-ink-500 py-8">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSaved={() => { toast.success('Product saved.'); fetch(); }}
        />
      )}
    </PageTransition>
  );
}
