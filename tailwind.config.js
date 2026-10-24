/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt: 'var(--color-surface-alt)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          input: 'var(--color-border-input)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          foreground: 'var(--color-on-accent)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          surface: 'var(--color-danger-surface)',
          text: 'var(--color-danger-text)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          surface: 'var(--color-success-surface)',
          text: 'var(--color-success-text)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          surface: 'var(--color-warning-surface)',
          text: 'var(--color-warning-text)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          surface: 'var(--color-info-surface)',
          text: 'var(--color-info-text)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--line-xs)', fontWeight: 'var(--weight-xs)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--line-sm)', fontWeight: 'var(--weight-sm)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--line-base)', fontWeight: 'var(--weight-base)' }],
        md: ['var(--text-md)', { lineHeight: 'var(--line-md)', fontWeight: 'var(--weight-md)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--line-lg)', fontWeight: 'var(--weight-lg)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--line-xl)', fontWeight: 'var(--weight-xl)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--line-2xl)', fontWeight: 'var(--weight-2xl)' }],
        display: ['var(--text-display)', { lineHeight: 'var(--line-display)', fontWeight: 'var(--weight-display)' }],
      },
      borderRadius: {
        none: 'var(--radius-none)',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
        modal: 'var(--shadow-modal)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed-width)',
      },
      height: {
        header: 'var(--header-height)',
      },
      maxWidth: {
        content: 'var(--content-max-width)',
      },
    },
  },
  plugins: [],
};
