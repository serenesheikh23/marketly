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

  // Fallback: professional gray placeholder, no first letter or emoji.
  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-ink-100 flex items-center justify-center ${className}`}
      role="img"
      aria-label={name}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-1/3 h-1/3 text-gray-300 dark:text-ink-300"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m21 16-5-5-9 9" />
      </svg>
    </div>
  );
}
