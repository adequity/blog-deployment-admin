/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          indigo: '#4F46E5',
          purple: '#9333EA',
        },
        success: '#10B981',
        info: '#3B82F6',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #4F46E5, #9333EA)',
        'gradient-hero': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
