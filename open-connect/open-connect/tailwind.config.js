/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      screens: {
        xs: '380px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      colors: {
        melody: {
          bgPrimary: '#0F0F14',
          bgSecondary: '#18181F',
          accentPrimary: '#8B5CF6',
          accentSecondary: '#A855F7',
          highlight: '#EC4899',
          textPrimary: '#FFFFFF',
          textSecondary: '#B3B3B3',
        }
      }
    },
  },
  plugins: [],
};
