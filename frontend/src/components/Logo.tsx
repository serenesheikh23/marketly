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
          d="M8 22V10h2.6v9h7.8V10H21v12h-2.6v-9.6H10.6V22H8z"
          fill="#0A0A0A"
        />
      </motion.svg>
      {showText && (
        <span className="text-ink-900 font-bold tracking-tighter text-lg">
          marketly
        </span>
      )}
    </div>
  );
}
