import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '@/api/client';
import { useAppDispatch, addToCart } from '@/store';
import { categoryApi } from '@/api/client';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [payload, setPayload] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    productApi.show(slug).then((res) => {
      setProduct(res.data.product);
      if (res.data.product.category_id) {
        // optional: load manual fields
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading…</div>;
  if (!product) return <div>Not found.</div>;

  const isManual = product.type === 'manual';

  const handleAddToCart = () => {
    dispatch(addToCart({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      payload: isManual ? payload : undefined,
    }));
    navigate('/cart');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <div className="flex gap-2 mb-4">
          {product.external_store_id && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">External Store</span>
          )}
          <span className={`text-xs px-2 py-1 rounded ${isManual ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
            {isManual ? 'Manual Service' : 'Auto Delivery'}
          </span>
        </div>
        <p className="text-gray-600 mb-6 whitespace-pre-line">{product.description}</p>
        <div className="text-sm text-gray-500">Category: {product.category?.name}</div>
        <div className="text-sm text-gray-500">In stock: {product.stock}</div>
      </div>

      <div className="card">
        <div className="text-3xl font-bold text-primary-600 mb-6">${Number(product.price).toFixed(2)}</div>

        {!isManual && (
          <div className="mb-4">
            <label className="label">Quantity</label>
            <input
              type="number"
              min="1"
              className="input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        )}

        {isManual && (
          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-600">Fill out the details for this manual service:</p>
            {['Link / Username', 'Quantity', 'Notes'].map((label) => (
              <div key={label}>
                <label className="label">{label}</label>
                <input
                  className="input"
                  value={payload[label] ?? ''}
                  onChange={(e) => setPayload((p) => ({ ...p, [label]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}

        <button onClick={handleAddToCart} className="btn-primary w-full">
          Add to Cart — ${(Number(product.price) * quantity).toFixed(2)}
        </button>
      </div>
    </div>
  );
}
