/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f6',
          500: '#0e86d4',
          600: '#0267b5',
          700: '#035293',
          800: '#074679',
          900: '#0c3b65',
          950: '#072442',
        },
        navy: {
          800: '#0f172a',
          850: '#0d1527',
          900: '#0a0f1d',
          950: '#060a14',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        },
        accent: '#0284c7',
      },
      fontFamily: {
        sans: ['"Urbanist"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Urbanist"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(12, 59, 101, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px -3px rgba(12, 59, 101, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 40px -6px rgba(12, 59, 101, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
