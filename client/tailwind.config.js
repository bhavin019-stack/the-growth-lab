/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAF8F5',
          subtle: '#F4F1EA',
          card: '#FFFFFF',
          border: '#E8E4DC',
          'border-strong': '#D3CDC0',
        },
        charcoal: {
          900: '#17181A',
          800: '#26282C',
          700: '#3D4148',
          600: '#5A606B',
          500: '#7B828F',
          400: '#9DA5B4',
          300: '#C5CBD5',
          200: '#E4E7ED',
          100: '#F1F3F6',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#FCE7DF',
          200: '#F8CEBE',
          300: '#F3AC94',
          400: '#EB8465',
          500: '#D95D39',
          600: '#C24723',
          700: '#A23617',
          800: '#842D15',
          900: '#6E2816',
        },
        forest: {
          50: '#F0F9F4',
          100: '#DCF1E6',
          200: '#BCE2D0',
          500: '#1E6F50',
          600: '#155B41',
          700: '#104733',
        },
        ochre: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        ink: {
          50: '#F0F5FA',
          100: '#DFEBF5',
          500: '#1E3A5F',
          600: '#172E4C',
          700: '#102137',
        },
        spruce: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#0F766E',
          600: '#0D625C',
          700: '#0A4D48',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Calistoga', 'Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(40, 30, 20, 0.05)',
        'warm': '0 4px 12px 0 rgba(40, 30, 20, 0.06), 0 1px 3px 0 rgba(40, 30, 20, 0.04)',
        'warm-lg': '0 12px 28px -4px rgba(40, 30, 20, 0.09), 0 4px 8px -2px rgba(40, 30, 20, 0.04)',
        'warm-xl': '0 20px 36px -6px rgba(40, 30, 20, 0.12), 0 8px 16px -4px rgba(40, 30, 20, 0.06)',
      }
    },
  },
  plugins: [],
}
