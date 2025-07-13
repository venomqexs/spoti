/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Foxenfy Brand Colors - Modern & Premium
        'foxenfy-primary': '#FF6B35',     // Vibrant Orange
        'foxenfy-secondary': '#2A9D8F',   // Teal Green
        'foxenfy-accent': '#E76F51',      // Coral
        'foxenfy-purple': '#6366F1',      // Indigo
        'foxenfy-pink': '#EC4899',        // Pink
        
        // Dark Theme Palette
        'foxenfy-black': '#0A0A0A',       // Deep Black
        'foxenfy-dark': '#111111',        // Darker Gray
        'foxenfy-gray-900': '#1A1A1A',    // Dark Gray
        'foxenfy-gray-800': '#2A2A2A',    // Medium Dark
        'foxenfy-gray-700': '#3A3A3A',    // Medium Gray
        'foxenfy-gray-600': '#4A4A4A',    // Light Medium
        'foxenfy-gray-500': '#6B7280',    // Gray
        'foxenfy-gray-400': '#9CA3AF',    // Light Gray
        'foxenfy-gray-300': '#D1D5DB',    // Very Light Gray
        'foxenfy-gray-200': '#E5E7EB',    // Almost White
        'foxenfy-white': '#FFFFFF',       // Pure White
        
        // Gradient Colors
        'foxenfy-gradient-start': '#FF6B35',
        'foxenfy-gradient-end': '#E76F51',
      },
      fontFamily: {
        'foxenfy': ['Inter', 'system-ui', 'sans-serif'],
        'foxenfy-display': ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 107, 53, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 107, 53, 0.4)',
        'inner-glow': 'inset 0 2px 10px rgba(255, 107, 53, 0.1)',
        'smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'smooth-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}