/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dynamic colors that can be overridden by CSS variables
        primary: {
          50: 'var(--color-primary-50, #f0f9ff)',
          100: 'var(--color-primary-100, #e0f2fe)',
          200: 'var(--color-primary-200, #bae6fd)',
          300: 'var(--color-primary-300, #7dd3fc)',
          400: 'var(--color-primary-400, #38bdf8)',
          500: 'var(--color-primary-500, #0ea5e9)',
          600: 'var(--color-primary-600, #0284c7)',
          700: 'var(--color-primary-700, #0369a1)',
          800: 'var(--color-primary-800, #075985)',
          900: 'var(--color-primary-900, #0c4a6e)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #f0fdf4)',
          100: 'var(--color-secondary-100, #dcfce7)',
          200: 'var(--color-secondary-200, #bbf7d0)',
          300: 'var(--color-secondary-300, #86efac)',
          400: 'var(--color-secondary-400, #4ade80)',
          500: 'var(--color-secondary-500, #22c55e)',
          600: 'var(--color-secondary-600, #16a34a)',
          700: 'var(--color-secondary-700, #15803d)',
          800: 'var(--color-secondary-800, #166534)',
          900: 'var(--color-secondary-900, #14532d)',
        },
        accent: {
          50: 'var(--color-accent-50, #fffbeb)',
          100: 'var(--color-accent-100, #fef3c7)',
          200: 'var(--color-accent-200, #fde68a)',
          300: 'var(--color-accent-300, #fcd34d)',
          400: 'var(--color-accent-400, #fbbf24)',
          500: 'var(--color-accent-500, #f59e0b)',
          600: 'var(--color-accent-600, #d97706)',
          700: 'var(--color-accent-700, #b45309)',
          800: 'var(--color-accent-800, #92400e)',
          900: 'var(--color-accent-900, #78350f)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'fun': '0 8px 32px -8px rgba(139, 92, 246, 0.3)',
        'rainbow': '0 8px 32px -8px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};