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
          DEFAULT: '#0B0E17', // Tournament of Power Arena Night Canvas
          subtle: '#121726',
          card: '#161D30',
          border: '#242F4A',
          'border-strong': '#00E5FF',
        },
        charcoal: {
          900: '#F4F7FB', // Light text on anime dark mode
          800: '#E1E7F0',
          700: '#C7D1E0',
          600: '#9FB0C8',
          500: '#7588A3',
          400: '#52647E',
          300: '#38465C',
          200: '#232E40',
          100: '#141A26',
        },
        dbs: {
          blue: {
            DEFAULT: '#00E5FF',
            glow: '#00F0FF',
            deep: '#0091EA',
            dark: '#005b96',
          },
          gold: {
            DEFAULT: '#FFD700',
            glow: '#FFE57F',
            deep: '#FF9100',
          },
          orange: {
            DEFAULT: '#FF6D00',
            glow: '#FF9E40',
            deep: '#DD2C00',
          },
          ui: {
            DEFAULT: '#E0F7FA',
            silver: '#CFD8DC',
            aura: '#80DEEA',
          },
          god: {
            DEFAULT: '#FF1744',
            glow: '#FF5252',
            deep: '#D50000',
          },
          scouter: {
            DEFAULT: '#00E676',
            glow: '#69F0AE',
            red: '#FF1744',
          },
          purple: {
            DEFAULT: '#B388FF',
            hakai: '#7C4DFF',
            deep: '#4A148C',
          }
        },
        terracotta: {
          50: '#1C1518',
          100: '#2D1B1E',
          200: '#4D2420',
          300: '#8C3524',
          400: '#C84724',
          500: '#FF5722', // Goku Gi Vibrant Orange
          600: '#E64A19',
          700: '#BF360C',
          800: '#872406',
          900: '#521402',
        },
        forest: {
          50: '#0C1A14',
          100: '#132E22',
          200: '#1E4A37',
          500: '#00E676', // Namek / Dragon Radar Emerald
          600: '#00C853',
          700: '#009624',
        },
        ochre: {
          50: '#1F1B0A',
          100: '#382F0F',
          200: '#574813',
          500: '#FFD700', // Super Saiyan Golden Ki
          600: '#FFAB00',
          700: '#FF6F00',
        },
        ink: {
          50: '#0D1624',
          100: '#14253D',
          500: '#00E5FF', // Super Saiyan Blue God Ki
          600: '#00B0FF',
          700: '#0091EA',
        },
        spruce: {
          50: '#0A181C',
          100: '#122D36',
          500: '#00B4D8',
          600: '#0096C7',
          700: '#03045E',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'ki-blue': '0 0 20px rgba(0, 229, 255, 0.4), inset 0 0 10px rgba(0, 229, 255, 0.15)',
        'ki-gold': '0 0 25px rgba(255, 215, 0, 0.45), inset 0 0 12px rgba(255, 215, 0, 0.2)',
        'ki-ui': '0 0 30px rgba(224, 247, 250, 0.5), inset 0 0 15px rgba(224, 247, 250, 0.25)',
        'ki-god': '0 0 25px rgba(255, 23, 68, 0.5), inset 0 0 12px rgba(255, 23, 68, 0.2)',
        'scouter': '0 0 15px rgba(0, 230, 118, 0.6), inset 0 0 8px rgba(0, 230, 118, 0.3)',
        'warm-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        'warm': '0 4px 14px 0 rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 229, 255, 0.2)',
        'warm-lg': '0 12px 30px -4px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 229, 255, 0.3)',
        'warm-xl': '0 20px 40px -6px rgba(0, 0, 0, 0.6), 0 0 3px rgba(0, 229, 255, 0.4)',
      },
      keyframes: {
        'ki-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.03)', opacity: '1', filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.8))' }
        },
        'scouter-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' }
        },
        'spark-flash': {
          '0%, 100%': { opacity: '0' },
          '25%, 75%': { opacity: '1' },
          '50%': { opacity: '0.2' }
        }
      },
      animation: {
        'ki-pulse': 'ki-pulse 2.5s ease-in-out infinite',
        'scouter-blink': 'scouter-blink 1.2s ease-in-out infinite',
        'spark-flash': 'spark-flash 0.8s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
