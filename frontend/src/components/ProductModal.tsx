import { useState, useEffect } from 'react';
import { adminProductApi, categoryApi } from '@/api/client';
import ImageUploader from './ImageUploader';
import Button from './Button';

interface ProductModalProps {
  product?: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductModal({ product, onClose, onSaved }: ProductModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? 0,
    category_id: product?.category_id ?? '',
    type: product?.type ?? 'auto',
    is_active: product?.is_active ?? true,
    image_base64: product?.image_base64 ?? '',
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!product;

  useEffect(() => {
    categoryApi.list()
      .then((r) => setCategories(r.data.categories ?? []))
      .catch(console.error);
  }, []);

  const set = (k: string) => (v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price as string),
        stock: parseInt(form.stock as string),
      };
      if (isEdit) {
        await adminProductApi.update(product.id, payload);
      } else {
        await adminProductApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-0/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card-pad w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 text-ink-900">{isEdit ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => set('name')(e.target.value)}
                required
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                className="input"
                value={form.category_id}
                onChange={(e) => set('category_id')(e.target.value)}
                required
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              placeholder="Product description"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                value={form.price}
                onChange={(e) => set('price')(e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Stock *</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.stock}
                onChange={(e) => set('stock')(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => set('type')(e.target.value)}
              >
                <option value="auto">Auto Delivery</option>
                <option value="manual">Manual Service</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              className="accent-accent-500"
              checked={form.is_active}
              onChange={(e) => set('is_active')(e.target.checked)}
            />
            <label htmlFor="is_active" className="text-sm text-ink-800">
              Active (visible to customers)
            </label>
          </div>
          <div>
            <label className="label">Product Image</label>
            <ImageUploader
              value={form.image_base64}
              onChange={(v) => set('image_base64')(v)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="accent" className="flex-1" loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
