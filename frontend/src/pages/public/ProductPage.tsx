import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productApi } from '@/api/client';
import { useAppDispatch, addToCart } from '@/store';
import Button from '@/components/Button';
import ProductImage from '@/components/ProductImage';
import PageTransition from '@/components/PageTransition';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [payload, setPayload] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    productApi.show(slug).then((res) => {
      setProduct(res.data.product);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-8 h-8 rounded-full border-2 border-accent-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <PageTransition className="text-center py-24">
        <p className="text-h3 text-ink-600 mb-4">Product not found.</p>
        <Link to="/" className="btn-accent">Back to home</Link>
      </PageTransition>
    );
  }

  const isManual = product.type === 'manual';

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity,
        payload: isManual ? payload : undefined,
      }),
    );
    navigate('/cart');
  };

  return (
    <PageTransition className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <p className="eyebrow mb-6">
        <Link to="/" className="hover:text-accent-300 transition-colors">Home</Link>
        {' / '}
        <Link
          to={`/category/${product.category?.slug}`}
          className="hover:text-accent-300 transition-colors"
        >
          {product.category?.name}
        </Link>
        {' / '}
        {product.name}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: product visual */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProductImage
            name={product.name}
            category={product.category?.name}
            className="w-full h-80 rounded-2xl"
          />
        </motion.div>

        {/* Right: details + purchase */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.external_store_id && (
                <span className="badge-neutral">External Store</span>
              )}
              <span className={`badge ${isManual ? 'badge-pending' : 'badge-completed'}`}>
                {isManual ? 'Manual Service' : 'Auto Delivery'}
              </span>
            </div>
            <h1 className="text-h1 text-ink-900 mb-2">{product.name}</h1>
            <div className="text-small text-ink-500">
              <span>Category: <Link to={`/category/${product.category?.slug}`} className="text-accent-400 hover:underline">{product.category?.name}</Link></span>
              <span className="mx-2">·</span>
              <span>In stock: <strong className="text-ink-700">{product.stock}</strong></span>
            </div>
          </div>

          <p className="text-body text-ink-600 whitespace-pre-line leading-relaxed">
            {product.description}
          </p>

          {/* Purchase card */}
          <div className="card-pad space-y-5">
            <div className="flex items-baseline gap-3">
              <span className="text-display-1 text-accent-400 font-bold">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-body text-ink-500">per unit</span>
            </div>

            {!isManual && (
              <div>
                <label className="label">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="btn-secondary btn-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    className="input w-20 text-center"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                  />
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="btn-secondary btn-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {isManual && (
              <div className="space-y-3">
                <p className="text-micro text-ink-500 uppercase tracking-wide">
                  Service details
                </p>
                {['Link / Username', 'Quantity', 'Notes (optional)'].map((label) => (
                  <div key={label}>
                    <label className="label">{label}</label>
                    <input
                      className="input"
                      placeholder={label}
                      value={payload[label] ?? ''}
                      onChange={(e) =>
                        setPayload((p) => ({ ...p, [label]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-body text-ink-600">
                Total:{' '}
                <strong className="text-ink-900">
                  ${(Number(product.price) * quantity).toFixed(2)}
                </strong>
              </span>
              <Button
                variant="accent"
                size="lg"
                onClick={handleAddToCart}
              >
                Add to cart
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
