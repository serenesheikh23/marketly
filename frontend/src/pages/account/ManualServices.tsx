import { useEffect, useState } from 'react';
import { categoryApi, orderApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function ManualServices() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryApi.list().then((r) => {
      const manual = (r.data.categories ?? []).filter((c: any) => c.type === 'manual');
      setCategories(manual);
    }).catch(console.error);
  }, []);

  const selectCategory = async (cat: any) => {
    setSelected(cat);
    try {
      const r = await categoryApi.formSchema(cat.slug);
      setFields(r.data.fields ?? []);
    } catch {
      setFields([]);
    }
    setFormData({});
    setQuantity(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const products = (selected.products ?? []).filter((p: any) => p.type === 'manual');
      if (products.length === 0) { toast.error('No products in this category.'); return; }
      await orderApi.create({
        items: [{
          product_id: products[0].id,
          quantity,
          payload: formData,
        }],
        payment_method: 'cash_wallet',
      });
      toast.success('Manual service order submitted!');
      setSelected(null);
      setFormData({});
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manual Services</h1>

      {!selected ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat)}
              className="card hover:shadow-md text-left transition"
            >
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-primary-600 mb-4">← Back to categories</button>
          <h2 className="text-xl font-bold mb-4">{selected.name}</h2>

          {fields.length > 0 ? (
            <form onSubmit={handleSubmit} className="card space-y-4 max-w-lg">
              {fields.map((f: any) => (
                <div key={f.key}>
                  <label className="label">{f.label}{f.required && ' *'}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      className="input"
                      rows={3}
                      required={f.required}
                      placeholder={f.placeholder}
                      value={formData[f.key] ?? ''}
                      onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      className="input"
                      required={f.required}
                      value={formData[f.key] ?? ''}
                      onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                    >
                      <option value="">Select…</option>
                      {(f.options ?? []).map((o: string) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      className="input"
                      required={f.required}
                      placeholder={f.placeholder}
                      value={formData[f.key] ?? ''}
                      onChange={(e) => setFormData((p) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="label">Quantity</label>
                <input type="number" min="1" className="input" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting…' : 'Place Order'}
              </button>
            </form>
          ) : (
            <p className="text-gray-500">No form fields defined for this category.</p>
          )}
        </div>
      )}
    </div>
  );
}
