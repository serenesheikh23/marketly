interface ProductImageProps {
  name: string;
  category?: string;
  className?: string;
}

/** Deterministic, locally-rendered product thumbnail — no external images. */
export default function ProductImage({ name, category, className = '' }: ProductImageProps) {
  // Pick a hue from the name so the same product always gets the same art.
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hueA = (hash * 47) % 360;
  const hueB = (hueA + 40) % 360;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-ink-100 ${className}`}
      aria-label={name}
    >
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`g-${hash}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${hueA} 50% 18%)`} />
            <stop offset="100%" stopColor={`hsl(${hueB} 40% 8%)`} />
          </linearGradient>
          <pattern id={`p-${hash}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#g-${hash})`} />
        <rect width="400" height="300" fill={`url(#p-${hash})`} />
        {/* soft glow blob */}
        <circle cx="320" cy="80" r="100" fill={`hsl(${hueA} 70% 35%)`} opacity="0.18" />
        {/* initials */}
        <text
          x="200"
          y="170"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="120"
          fill="rgba(255,255,255,0.08)"
          letterSpacing="-6"
        >
          {initials}
        </text>
        {category && (
          <text
            x="200"
            y="270"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
            fontSize="12"
            letterSpacing="2"
            fill="rgba(255,255,255,0.4)"
          >
            {category.toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  );
}
