import type { Config } from 'tailwindcss';

/**
 * Jabali Trails Africa — Tailwind design tokens.
 *
 * Every colour resolves to an RGB-channel CSS variable declared in
 * `src/app/globals.css` (`:root` = Daylight, `.dark` = Night Field mode), which
 * keeps Tailwind's `/opacity` modifiers working in both themes.
 *
 *  - surface / heading / ink / line  → flip between themes (page layer)
 *  - canopy / parchment / terracotta / acacia → brand layer (panels stay deep)
 */
const withVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: withVar('--surface'),
          raised: withVar('--surface-raised'),
          sunk: withVar('--surface-sunk'),
        },
        heading: withVar('--heading'),
        ink: {
          DEFAULT: withVar('--ink'),
          muted: withVar('--ink-muted'),
          subtle: withVar('--ink-subtle'),
        },
        line: withVar('--line'),
        field: {
          DEFAULT: withVar('--field'),
          line: withVar('--field-line'),
        },
        canopy: {
          DEFAULT: withVar('--panel'),
          moss: withVar('--panel-2'),
          fern: withVar('--panel-3'),
          mist: withVar('--panel-3'),
        },
        parchment: {
          DEFAULT: withVar('--panel-ink'),
          light: withVar('--panel-ink'),
          dark: withVar('--panel-line'),
        },
        bark: {
          DEFAULT: withVar('--ink'),
          muted: withVar('--ink-muted'),
          subtle: withVar('--ink-subtle'),
        },
        terracotta: {
          DEFAULT: withVar('--accent'),
          hover: withVar('--accent-hover'),
          light: withVar('--accent-soft'),
        },
        acacia: {
          DEFAULT: withVar('--gold'),
          light: withVar('--gold-soft'),
          dark: withVar('--gold-deep'),
        },
        pos: {
          DEFAULT: withVar('--pos'),
          soft: withVar('--pos-soft'),
        },
        neg: {
          DEFAULT: withVar('--bad'),
          soft: withVar('--bad-soft'),
        },
      },
      fontFamily: {
        display: ['var(--font-sora)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sen)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        /* Legacy aliases — the catalogue used `font-serif` for headings; both now
           render in Sora so nothing silently falls back to a system serif. */
        serif: ['var(--font-sora)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-sora)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        card: 'var(--shadow-1)',
        elevated: 'var(--shadow-2)',
        deep: 'var(--shadow-3)',
        ring: '0 0 0 3px rgb(var(--ring) / 0.35)',
      },
      maxWidth: {
        shell: '84rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          to: { opacity: '1', transform: 'none' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translate3d(0, -10px, 0)' },
          to: { opacity: '1', transform: 'none' },
        },
        'zoom-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'slide-down': 'slide-down 0.28s cubic-bezier(0.22, 1, 0.36, 1) both',
        'zoom-in': 'zoom-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 7s ease-in-out infinite',
      },
      transitionTimingFunction: {
        field: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      letterSpacing: {
        label: '0.14em',
      },
      backgroundImage: {
        'fade-b': 'linear-gradient(180deg, transparent 0%, rgb(var(--panel) / 0.9) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
