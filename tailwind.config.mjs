/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // PRD Color Palette
        brand: {
          cyan: '#3EC1D3',
          cream: '#F6F7D7',
          orange: '#FF9A00',
          pink: '#FF165D',
        },
        // Neutral colors for text
        text: {
          primary: '#171717',
          muted: '#5B5B5B',
        },
        surface: '#FFFFFF',
      },
      fontFamily: {
        // taste-skill typography - avoiding Inter for headings
        display: ['Syne', 'Outfit', 'Cabinet Grotesk', 'Satoshi', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        // taste-skill motion defaults with spring physics
        'spring-in': 'spring-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'spring-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      spacing: {
        // taste-skill spacing scale
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};
