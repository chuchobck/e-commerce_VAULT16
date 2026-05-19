/** @type {import('tailwindcss').Config} */

// ─────────────────────────────────────────────────────────────────────────────
//  VORTEX — Tailwind Config
//  Paleta: Asphalt (Gris carbón · Azul eléctrico)
//  Dark mode: class strategy (toggle manual con Zustand uiStore)
//  Versión Tailwind: 3.4.x
// ─────────────────────────────────────────────────────────────────────────────

const colors = {

  // ── NEUTRALES ASPHALT ────────────────────────────────────────────────────
  // Usados como fondo, surface y bordes según el modo activo.

  asphalt: {
    950: '#0E1114',   // fondo máximo dark (casi negro, no puro)
    900: '#181C1F',   // bg-primary dark
    800: '#1E2428',   // bg-secondary dark (hover sutil)
    700: '#252A2E',   // surface / navbar dark
    600: '#2E353B',   // card dark
    500: '#353C42',   // card hover / border dark
    400: '#4A535A',   // border secondary dark / placeholder text
    300: '#6B757D',   // muted text dark
    200: '#9AA3AB',   // secondary text dark
    100: '#C8CDD1',   // primary text dark (no tan blanco, más cómodo)
    50:  '#F0F2F4',   // bg-primary light / texto en dark máximo contraste
  },

  // ── AZUL ELÉCTRICO (acento único) ────────────────────────────────────────
  // Solo para CTAs, precios, badges activos, links, selección de talla.
  // NO usar para decoración.

  electric: {
    950: '#0A1628',   // badge bg dark
    900: '#0E1F3D',
    800: '#1D3A6B',   // badge bg light hover
    700: '#1D4ED8',   // precio / link light
    600: '#2563EB',   // btn hover light
    500: '#3B82F6',   // btn primary / acento base
    400: '#60A5FA',   // precio / link dark
    300: '#93C5FD',   // badge text dark
    200: '#BFDBFE',   // badge bg dark
    100: '#DBEAFE',   // badge bg light
    50:  '#EFF6FF',   // badge bg light hover
  },

  // ── SEMANTIC ─────────────────────────────────────────────────────────────
  // Para estados del sistema (Nielsen H1: visibilidad del estado).

  success: {
    dark:  '#4ADE80',   // texto success en dark
    light: '#16A34A',   // texto success en light
    bgDark:  '#052E16',
    bgLight: '#DCFCE7',
  },

  warning: {
    dark:  '#FACC15',
    light: '#D97706',
    bgDark:  '#1C1400',
    bgLight: '#FEF9C3',
  },

  danger: {
    dark:  '#F87171',
    light: '#DC2626',
    bgDark:  '#1F0505',
    bgLight: '#FEE2E2',
  },
}

module.exports = {

  // ── Dark mode por clase (class strategy) ─────────────────────────────────
  // El toggle vive en uiStore.ts de Zustand.
  // En App.tsx: <div className={isDark ? 'dark' : ''}>
  darkMode: 'class',

  // ── Content paths ─────────────────────────────────────────────────────────
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {

      // ── COLORES SEMÁNTICOS ─────────────────────────────────────────────
      // Estos son los que usás en className directamente.
      // El componente no sabe si está en dark o light: solo usa el token.

      colors: {

        // Paleta raw (para casos edge)
        asphalt: colors.asphalt,
        electric: colors.electric,

        // ── FONDOS ────────────────────────────────────────────────────────
        // bg-base      → fondo de la página
        // bg-surface   → navbar, sidebar, drawer
        // bg-card      → product cards, modales
        // bg-hover     → hover de cards y filas

        'bg-base': {
          DEFAULT: colors.asphalt[50],          // light: #F0F2F4
          dark:    colors.asphalt[900],          // dark:  #181C1F
        },
        'bg-surface': {
          DEFAULT: '#FFFFFF',                    // light: blanco puro
          dark:    colors.asphalt[700],          // dark:  #252A2E
        },
        'bg-card': {
          DEFAULT: '#FFFFFF',
          dark:    colors.asphalt[600],          // dark:  #2E353B
        },
        'bg-hover': {
          DEFAULT: colors.asphalt[50],
          dark:    colors.asphalt[800],
        },

        // ── BORDES ────────────────────────────────────────────────────────
        'border-base': {
          DEFAULT: colors.asphalt[200],          // light: #9AA3AB (suave)
          dark:    colors.asphalt[500],          // dark:  #353C42
        },
        'border-strong': {
          DEFAULT: colors.asphalt[300],
          dark:    colors.asphalt[400],
        },

        // ── TEXTO ─────────────────────────────────────────────────────────
        'text-primary': {
          DEFAULT: colors.asphalt[900],          // light: #181C1F
          dark:    colors.asphalt[50],           // dark:  #F0F2F4
        },
        'text-secondary': {
          DEFAULT: colors.asphalt[400],          // light: #4A535A
          dark:    colors.asphalt[200],          // dark:  #9AA3AB
        },
        'text-muted': {
          DEFAULT: colors.asphalt[300],          // light: #6B757D
          dark:    colors.asphalt[300],
        },
        'text-inverse': {
          DEFAULT: '#FFFFFF',                    // sobre fondo oscuro en light
          dark:    colors.asphalt[900],
        },

        // ── ACENTO (azul eléctrico) ────────────────────────────────────────
        'accent': {
          DEFAULT: colors.electric[500],         // #3B82F6 — base
          hover:   colors.electric[600],         // #2563EB — hover
          active:  colors.electric[700],         // #1D4ED8 — pressed
          muted:   colors.electric[100],         // badge bg light
          text:    colors.electric[700],         // texto acento light
          'dark-muted': colors.electric[950],    // badge bg dark
          'dark-text':  colors.electric[400],   // precio / link dark
        },

        // ── SEMANTIC ──────────────────────────────────────────────────────
        'status-success': colors.success.light,
        'status-success-bg': colors.success.bgLight,
        'status-success-dark': colors.success.dark,
        'status-success-bg-dark': colors.success.bgDark,

        'status-warning': colors.warning.light,
        'status-warning-bg': colors.warning.bgLight,
        'status-warning-dark': colors.warning.dark,
        'status-warning-bg-dark': colors.warning.bgDark,

        'status-danger': colors.danger.light,
        'status-danger-bg': colors.danger.bgLight,
        'status-danger-dark': colors.danger.dark,
        'status-danger-bg-dark': colors.danger.bgDark,
      },

      // ── TIPOGRAFÍA ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        // Scale mínima — Nielsen H8: diseño estético y minimalista
        // Nada menor a 12px en UI visible.
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
        normal:  '400',
        medium:  '500',
        // NO usar semibold (600) ni bold (700) — pesan visualmente
        // Solo usar en hero / precio de producto donde el peso encode jerarquía
        semibold: '600',
      },

      // ── ESPACIADO ─────────────────────────────────────────────────────────
      // Múltiplos de 4px para consistencia visual (gestalt: proximidad)
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

      // ── BORDER RADIUS ─────────────────────────────────────────────────────
      borderRadius: {
        'none': '0',
        'sm':   '4px',    // badges, chips pequeños
        'md':   '8px',    // inputs, botones, tags
        'lg':   '12px',   // cards de producto
        'xl':   '16px',   // modales, drawers
        '2xl':  '24px',   // hero sections
        'full': '9999px', // pills, avatares
      },

      // ── SOMBRAS ───────────────────────────────────────────────────────────
      // Mínimas — no usar para decoración, solo para elevación funcional.
      // Nielsen H8: estético y minimalista.
      boxShadow: {
        'none': 'none',
        'card': '0 1px 3px 0 rgba(0,0,0,0.08)',           // product card light
        'card-dark': '0 1px 3px 0 rgba(0,0,0,0.35)',      // product card dark
        'modal': '0 8px 32px 0 rgba(0,0,0,0.12)',
        'modal-dark': '0 8px 32px 0 rgba(0,0,0,0.5)',
        'focus': '0 0 0 3px rgba(59,130,246,0.35)',        // focus ring acento
      },

      // ── TRANSICIONES ──────────────────────────────────────────────────────
      // 150ms para interacciones, 250ms para aparición de elementos.
      // Nielsen H6: reconocimiento > recuerdo → feedback visual inmediato.
      transitionDuration: {
        'fast':   '150ms',
        'normal': '250ms',
        'slow':   '400ms',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ── BREAKPOINTS ───────────────────────────────────────────────────────
      // Desktop-first para e-commerce (mayor conversión en desktop)
      // Mobile igual funciona — Tailwind mobile-first por defecto.
      screens: {
        'xs':  '375px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1440px',
      },

      // ── ANCHO MÁXIMO DE CONTENIDO ─────────────────────────────────────────
      maxWidth: {
        'content': '1280px',   // max-w-content → contenedor principal de páginas
        'card':    '320px',    // max-w-card    → product cards
        'modal':   '480px',    // max-w-modal   → modales auth y confirmaciones
        'drawer':  '420px',    // max-w-drawer  → carrito drawer
        'prose':   '680px',    // max-w-prose   → descripción de producto
      },

      // ── GRID DE PRODUCTOS ─────────────────────────────────────────────────
      gridTemplateColumns: {
        // Catálogo de productos
        'products-2': 'repeat(2, minmax(0, 1fr))',
        'products-3': 'repeat(3, minmax(0, 1fr))',
        'products-4': 'repeat(4, minmax(0, 1fr))',
        // Tallas (selector)
        'sizes': 'repeat(auto-fill, minmax(48px, 1fr))',
      },

      // ── ASPECT RATIOS ─────────────────────────────────────────────────────
      // Imágenes de producto siempre 3:4 (portrait, estándar streetwear)
      aspectRatio: {
        'product': '3 / 4',
        'banner':  '16 / 5',
        'square':  '1 / 1',
      },

      // ── Z-INDEX ───────────────────────────────────────────────────────────
      // Definidos explícitamente para evitar z-index hell.
      // Nielsen H1: el usuario siempre sabe qué está encima de qué.
      zIndex: {
        'behind':  '-1',
        'base':    '0',
        'raised':  '10',   // product card hover
        'sticky':  '20',   // navbar sticky
        'drawer':  '30',   // carrito drawer
        'modal':   '40',   // modales
        'toast':   '50',   // notificaciones (siempre arriba de todo)
        'max':     '99',
      },
    },
  },

  plugins: [
    // ── Plugin: scrollbar hide ─────────────────────────────────────────────
    // Para el selector de tallas y el carrusel de fotos horizontales.
    // npm install -D tailwind-scrollbar-hide
    require('tailwind-scrollbar-hide'),

    // ── Plugin: line-clamp ────────────────────────────────────────────────
    // Para truncar nombres de producto en cards (ya incluido en Tailwind 3.3+)
    // Si usás Tailwind 3.4 no hace falta instalar nada extra.
  ],
}
