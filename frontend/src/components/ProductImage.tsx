import type { ReactNode } from 'react';

interface ProductImageProps {
  name: string;
  category?: string;
  imageBase64?: string;
  imageUrl?: string;
  className?: string;
}

/** Product thumbnail: prefers imageUrl, falls back to imageBase64, then renders a clean placeholder icon. */
export default function ProductImage({ name, imageBase64, imageUrl, className = '' }: ProductImageProps): ReactNode {
  const src = imageUrl ?? imageBase64;

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

  // Fallback: package emoji, no first letter.
  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-ink-100 flex items-center justify-center ${className}`}
      role="img"
      aria-label={name}
    >
      <span className="text-4xl" aria-hidden="true">📦</span>
    </div>
  );
}
