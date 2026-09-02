import { useState } from 'react';
import { adminCategoryApi } from '@/api/client';
import toast from 'react-hot-toast';
import IconPicker from './IconPicker';
import ImageUploader from './ImageUploader';
import Button from './Button';

interface CategoryModalProps {
  category?: {
    id: number;
    name: string;
    type: string;
    description: string;
    icon: string;
    image_base64: string;
    sort_order: number;
  };
  onClose: () => void;
  onSaved: () => void;
}

export default function CategoryModal({ category, onClose, onSaved }: CategoryModalProps) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    type: category?.type ?? 'auto',
    description: category?.description ?? '',
    icon: category?.icon ?? '',
    image_base64: category?.image_base64 ?? '',
    sort_order: category?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!category;

  const set = (k: string) => (v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await adminCategoryApi.update(category.id, form);
      } else {
        await adminCategoryApi.create(form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-0/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card-pad w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 text-ink-900">
            {isEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              required
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => set('type')(e.target.value)}
            >
              <option value="auto">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="label">Icon</label>
            <IconPicker value={form.icon} onChange={(v) => set('icon')(v)} />
            {form.icon && (
              <p className="text-micro text-ink-500 mt-1">
                Selected: <span className="font-mono">{form.icon}</span>
              </p>
            )}
          </div>
          <div>
            <label className="label">Image</label>
            <ImageUploader
              value={form.image_base64}
              onChange={(v) => set('image_base64')(v)}
            />
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input
              type="number"
              className="input w-32"
              value={form.sort_order}
              onChange={(e) => set('sort_order')(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="accent" className="flex-1" loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Category'}
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
