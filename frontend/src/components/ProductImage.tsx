import type { ReactNode } from 'react';

interface ProductImageProps {
  name: string;
  category?: string;
  categoryImageUrl?: string;
  imageBase64?: string;
  imageUrl?: string;
  className?: string;
}

const COLORS = [
  { bg: 'bg-red-500/15',     text: 'text-red-500' },
  { bg: 'bg-orange-500/15',  text: 'text-orange-500' },
  { bg: 'bg-amber-500/15',   text: 'text-amber-500' },
  { bg: 'bg-yellow-500/15',  text: 'text-yellow-500' },
  { bg: 'bg-lime-500/15',    text: 'text-lime-500' },
  { bg: 'bg-green-500/15',   text: 'text-green-500' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-500' },
  { bg: 'bg-teal-500/15',    text: 'text-teal-500' },
  { bg: 'bg-cyan-500/15',    text: 'text-cyan-500' },
  { bg: 'bg-sky-500/15',     text: 'text-sky-500' },
  { bg: 'bg-blue-500/15',    text: 'text-blue-500' },
  { bg: 'bg-indigo-500/15',  text: 'text-indigo-500' },
  { bg: 'bg-violet-500/15',  text: 'text-violet-500' },
  { bg: 'bg-purple-500/15',  text: 'text-purple-500' },
  { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-500' },
  { bg: 'bg-pink-500/15',    text: 'text-pink-500' },
];

function pickColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function ProductImage({
  name,
  categoryImageUrl,
  imageBase64,
  imageUrl,
  className = '',
}: ProductImageProps): ReactNode {
  const src = imageUrl ?? imageBase64;

  // 1. Real product image — show it clean
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

  // 2. No product image, but category has one — use it as background + name overlay
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
        {/* Dark gradient from bottom so the name is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
        {/* Product name overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2 drop-shadow-md">
            {name}
          </p>
        </div>
      </div>
    );
  }

  // 3. Neither product nor category has an image — colored letter fallback
  const trimmed = (name || '').trim();
  const letter = trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  const color = pickColor(trimmed || 'default');

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg flex items-center justify-center ${color.bg} ${className}`}
      role="img"
      aria-label={name}
    >
      <span className={`font-bold text-5xl ${color.text}`} aria-hidden="true">{letter}</span>
    </div>
  );
}
