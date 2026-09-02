/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Surfaces
        ink: {
          DEFAULT: '#0A0A0A',   // base background (use `bg-ink`)
          base:    '#0A0A0A',   // base background (use `bg-ink-base`)
          50: '#111111',    // raised
          100: '#161616',   // card
          200: '#1F1F1F',   // border / hover
          300: '#2A2A2A',   // divider
          400: '#3D3D3D',
          500: '#5C5C5C',   // muted text
          600: '#8A8A8A',   // secondary text
          700: '#B5B5B5',   // body
          800: '#E5E5E5',   // near-white text
          900: '#FAFAFA',   // heading
        },
        // Single vibrant accent — Emerald
        accent: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',   // primary accent
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        // Status colors — desaturated, not playful
        status: {
          pending: '#F5A524',
          processing: '#3B82F6',
          completed: '#10B981',
          rejected: '#EF4444',
          vip: '#A78BFA',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      },
      fontSize: {
        // Aggressive type hierarchy
        'display-1': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-2': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h1':         ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2':         ['1.875rem',{ lineHeight: '1.2',  letterSpacing: '-0.02em',  fontWeight: '700' }],
        'h3':         ['1.375rem',{ lineHeight: '1.3',  letterSpacing: '-0.015em', fontWeight: '600' }],
        'body-lg':    ['1.0625rem',{ lineHeight: '1.6' }],
        'body':       ['0.9375rem',{ lineHeight: '1.6' }],
        'small':      ['0.8125rem',{ lineHeight: '1.5' }],
        'micro':      ['0.6875rem',{ lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      borderRadius: {
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'soft':   '0 1px 2px 0 rgba(0,0,0,0.4)',
        'lift':   '0 8px 24px -8px rgba(0,0,0,0.6), 0 1px 2px 0 rgba(0,0,0,0.4)',
        'glow':   '0 0 0 1px rgba(16,185,129,0.3), 0 8px 24px -8px rgba(16,185,129,0.25)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
