import { useState } from 'react';
import { adminCategoryApi } from '@/api/client';
import toast from 'react-hot-toast';
import Modal from './Modal';
import IconPicker from './IconPicker';
import ImageUploader from './ImageUploader';
import Button from './Button';

interface CategoryModalProps {
  category?: {
    id: number;
    name: string;
    name_ar?: string;
    type: string;
    description: string;
    description_ar?: string;
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
    name_ar: category?.name_ar ?? '',
    type: category?.type ?? 'auto',
    description: category?.description ?? '',
    description_ar: category?.description_ar ?? '',
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
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'New Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name (EN) *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              required
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="label">Name (AR)</label>
            <input
              className="input"
              dir="rtl"
              value={form.name_ar}
              onChange={(e) => set('name_ar')(e.target.value)}
              placeholder="اسم الفئة"
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
            <label className="label">Description (EN)</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="label">Description (AR)</label>
            <textarea
              className="input"
              rows={2}
              dir="rtl"
              value={form.description_ar}
              onChange={(e) => set('description_ar')(e.target.value)}
              placeholder="وصف اختياري"
            />
          </div>
          <div>
            <label className="label">Icon</label>
            <IconPicker value={form.icon} onChange={(v) => set('icon')(v)} />
            {form.icon && (
              <p className="text-micro text-gray-600 dark:text-ink-500 mt-1">
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
    </Modal>
  );
}
