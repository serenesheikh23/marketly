import type { ReactNode } from 'react';
import { categoryEmoji } from '@/utils/categoryEmoji';

interface ProductImageProps {
  name: string;
  category?: string;
  categoryImageUrl?: string;
  imageBase64?: string;
  imageUrl?: string;
  className?: string;
}

const BG_TINTS = [
  'bg-red-500/10',
  'bg-orange-500/10',
  'bg-amber-500/10',
  'bg-emerald-500/10',
  'bg-teal-500/10',
  'bg-cyan-500/10',
  'bg-sky-500/10',
  'bg-blue-500/10',
  'bg-indigo-500/10',
  'bg-violet-500/10',
  'bg-purple-500/10',
  'bg-pink-500/10',
];

function tint(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return BG_TINTS[Math.abs(h) % BG_TINTS.length];
}

export default function ProductImage({
  name,
  category,
  categoryImageUrl,
  imageBase64,
  imageUrl,
  className = '',
}: ProductImageProps): ReactNode {
  const src = imageUrl ?? imageBase64;

  // 1. Real product image
  if (src) {
    return (
      <div className={`relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-ink-100 ${className}`}>
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // 2. No product image, but category has one
  if (categoryImageUrl) {
    return (
      <div className={`relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-ink-100 ${className}`}>
        <img
          src={categoryImageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2 drop-shadow-md">
            {name}
          </p>
        </div>
      </div>
    );
  }

  // 3. Neither product nor category has an image — category emoji fallback
  const emoji = categoryEmoji(category || name);
  const bg = tint(category || name || 'default');

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg flex items-center justify-center ${bg} ${className}`}
      role="img"
      aria-label={name}
    >
      <span className="text-5xl select-none" aria-hidden="true">
        {emoji}
      </span>
    </div>
  );
}
