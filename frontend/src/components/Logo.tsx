import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const px = size === 'sm' ? 24 : size === 'md' ? 32 : 44;
  return (
    <div className="flex items-center gap-2.5">
      <motion.svg
        whileHover={{ rotate: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        width={px}
        height={px}
        viewBox="0 0 32 32"
        fill="none"
      >
        <rect width="32" height="32" rx="8" fill="#10B981" />
        <path
          d="M8 22V10h2.6l5.2 7.5V10H18v12h-2.6l-5.2-7.5V22H8z"
          fill="#0A0A0A"
        />
        <circle cx="24" cy="11" r="1.6" fill="#0A0A0A" />
      </motion.svg>
      {showText && (
        <span className="text-ink-900 font-bold tracking-tighter text-lg">
          marketly
        </span>
      )}
    </div>
  );
}
