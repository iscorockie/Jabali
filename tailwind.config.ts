import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F6F3EC',
          light: '#FDFBF7',
          dark: '#EBE5D8',
        },
        canopy: {
          DEFAULT: '#112218',
          moss: '#1A3124',
          fern: '#274434',
          mist: '#3A5E4A',
        },
        terracotta: {
          DEFAULT: '#B8532E',
          hover: '#9A4120',
          light: '#F9EDE8',
        },
        acacia: {
          DEFAULT: '#C89B3C',
          light: '#FBF5E6',
          dark: '#9A7322',
        },
        bark: {
          DEFAULT: '#181A17',
          muted: '#4E554B',
          subtle: '#787F74',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        card: '0 20px 40px -15px rgba(17, 34, 24, 0.08)',
        elevated: '0 25px 50px -12px rgba(17, 34, 24, 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
