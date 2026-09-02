interface HeroArtProps {
  variant?: 'aurora' | 'grid' | 'orbs';
  className?: string;
}

/** A custom inline-SVG hero illustration — no stock images. */
export default function HeroArt({ variant = 'aurora', className = '' }: HeroArtProps) {
  if (variant === 'grid') {
    return (
      <svg viewBox="0 0 600 600" className={className} aria-hidden>
        <defs>
          <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="#1F1F1F" strokeWidth="1" />
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="600" height="600" fill="#0A0A0A" />
        <rect width="600" height="600" fill="url(#g)" />
        <circle cx="300" cy="300" r="240" fill="url(#glow)" />
        <g stroke="#10B981" strokeWidth="1" fill="none" opacity="0.5">
          <circle cx="300" cy="300" r="120" />
          <circle cx="300" cy="300" r="180" />
        </g>
        <g fill="#10B981">
          <circle cx="300" cy="120" r="3" />
          <circle cx="480" cy="300" r="3" />
          <circle cx="300" cy="480" r="3" />
          <circle cx="120" cy="300" r="3" />
        </g>
      </svg>
    );
  }

  if (variant === 'orbs') {
    return (
      <svg viewBox="0 0 600 600" className={className} aria-hidden>
        <defs>
          <radialGradient id="o1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="o2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="600" height="600" fill="#0A0A0A" />
        <circle cx="200" cy="200" r="240" fill="url(#o1)" />
        <circle cx="450" cy="400" r="200" fill="url(#o2)" />
      </svg>
    );
  }

  // aurora (default)
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden>
      <defs>
        <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#34D399" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
        </linearGradient>
        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1F1F1F" />
        </pattern>
      </defs>
      <rect width="600" height="600" fill="#0A0A0A" />
      <rect width="600" height="600" fill="url(#dots)" opacity="0.6" />
      <path
        d="M0 380 C150 300, 300 460, 600 320 L600 600 L0 600 Z"
        fill="url(#aurora)"
      />
      <path
        d="M0 420 C200 380, 350 500, 600 420 L600 600 L0 600 Z"
        fill="#10B981"
        opacity="0.05"
      />
    </svg>
  );
}
