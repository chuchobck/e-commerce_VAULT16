/** @type {import('tailwindcss').Config} */

// ─────────────────────────────────────────────────────────────────────────────
//  VORTEX — Tailwind Config
//  Paleta: Asphalt (Gris carbón · Azul eléctrico)
//  Dark mode: class strategy (toggle manual con Zustand uiStore)
// ─────────────────────────────────────────────────────────────────────────────

const colors = {
  asphalt: {
    950: '#0E1114',
    900: '#181C1F',
    800: '#1E2428',
    700: '#252A2E',
    600: '#2E353B',
    500: '#353C42',
    400: '#4A535A',
    300: '#6B757D',
    200: '#9AA3AB',
    100: '#C8CDD1',
    50:  '#F0F2F4',
  },
  electric: {
    950: '#0A1628',
    900: '#0E1F3D',
    800: '#1D3A6B',
    700: '#1D4ED8',
    600: '#2563EB',
    500: '#3B82F6',
    400: '#60A5FA',
    300: '#93C5FD',
    200: '#BFDBFE',
    100: '#DBEAFE',
    50:  '#EFF6FF',
  },
  success: {
    dark:    '#4ADE80',
    light:   '#16A34A',
    bgDark:  '#052E16',
    bgLight: '#DCFCE7',
  },
  warning: {
    dark:    '#FACC15',
    light:   '#D97706',
    bgDark:  '#1C1400',
    bgLight: '#FEF9C3',
  },
  danger: {
    dark:    '#F87171',
    light:   '#DC2626',
    bgDark:  '#1F0505',
    bgLight: '#FEE2E2',
  },
}

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        asphalt:  colors.asphalt,
        electric: colors.electric,

        'bg-base':    { DEFAULT: colors.asphalt[50],  dark: colors.asphalt[900] },
        'bg-surface': { DEFAULT: '#FFFFFF',            dark: colors.asphalt[700] },
        'bg-card':    { DEFAULT: '#FFFFFF',            dark: colors.asphalt[600] },
        'bg-hover':   { DEFAULT: colors.asphalt[50],  dark: colors.asphalt[800] },

        'border-base':   { DEFAULT: colors.asphalt[200], dark: colors.asphalt[500] },
        'border-strong': { DEFAULT: colors.asphalt[300], dark: colors.asphalt[400] },

        'text-primary':   { DEFAULT: colors.asphalt[900], dark: colors.asphalt[50]  },
        'text-secondary': { DEFAULT: colors.asphalt[400], dark: colors.asphalt[200] },
        'text-muted':     { DEFAULT: colors.asphalt[300], dark: colors.asphalt[300] },
        'text-inverse':   { DEFAULT: '#FFFFFF',            dark: colors.asphalt[900] },

        accent: {
          DEFAULT:       colors.electric[500],
          hover:         colors.electric[600],
          active:        colors.electric[700],
          muted:         colors.electric[100],
          text:          colors.electric[700],
          'dark-muted':  colors.electric[950],
          'dark-text':   colors.electric[400],
        },

        'status-success':        colors.success.light,
        'status-success-bg':     colors.success.bgLight,
        'status-success-dark':   colors.success.dark,
        'status-success-bg-dark':colors.success.bgDark,
        'status-warning':        colors.warning.light,
        'status-warning-bg':     colors.warning.bgLight,
        'status-warning-dark':   colors.warning.dark,
        'status-warning-bg-dark':colors.warning.bgDark,
        'status-danger':         colors.danger.light,
        'status-danger-bg':      colors.danger.bgLight,
        'status-danger-dark':    colors.danger.dark,
        'status-danger-bg-dark': colors.danger.bgDark,
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'xs':   ['12px', { lineHeight: '16px' }],
        'sm':   ['13px', { lineHeight: '20px' }],
        'base': ['15px', { lineHeight: '24px' }],
        'lg':   ['17px', { lineHeight: '28px' }],
        'xl':   ['20px', { lineHeight: '30px' }],
        '2xl':  ['24px', { lineHeight: '32px' }],
        '3xl':  ['30px', { lineHeight: '38px' }],
        '4xl':  ['36px', { lineHeight: '44px' }],
      },

      fontWeight: {
        normal:   '400',
        medium:   '500',
        semibold: '600',
      },

      spacing: {
        '0.5': '2px',
        '1':   '4px',
        '2':   '8px',
        '3':   '12px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '8':   '32px',
        '10':  '40px',
        '12':  '48px',
        '16':  '64px',
        '20':  '80px',
        '24':  '96px',
        '32':  '128px',
      },

      borderRadius: {
        'none': '0',
        'sm':   '4px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '24px',
        'full': '9999px',
      },

      boxShadow: {
        'none':       'none',
        'card':       '0 1px 3px 0 rgba(0,0,0,0.08)',
        'card-dark':  '0 1px 3px 0 rgba(0,0,0,0.35)',
        'modal':      '0 8px 32px 0 rgba(0,0,0,0.12)',
        'modal-dark': '0 8px 32px 0 rgba(0,0,0,0.5)',
        'focus':      '0 0 0 3px rgba(59,130,246,0.35)',
      },

      transitionDuration: {
        'fast':   '150ms',
        'normal': '250ms',
        'slow':   '400ms',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      screens: {
        'xs':  '375px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1440px',
      },

      maxWidth: {
        'content': '1280px',
        'card':    '320px',
        'modal':   '480px',
        'drawer':  '420px',
        'prose':   '680px',
      },

      gridTemplateColumns: {
        'products-2': 'repeat(2, minmax(0, 1fr))',
        'products-3': 'repeat(3, minmax(0, 1fr))',
        'products-4': 'repeat(4, minmax(0, 1fr))',
        'sizes':      'repeat(auto-fill, minmax(48px, 1fr))',
      },

      aspectRatio: {
        'product': '3 / 4',
        'banner':  '16 / 5',
        'square':  '1 / 1',
      },

      zIndex: {
        'behind': '-1',
        'base':   '0',
        'raised': '10',
        'sticky': '20',
        'drawer': '30',
        'modal':  '40',
        'toast':  '50',
        'max':    '99',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}

