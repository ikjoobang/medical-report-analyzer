/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Noto Sans KR', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0891b2',
          dark: '#22d3ee',
        },
        secondary: {
          DEFAULT: '#06b6d4',
          dark: '#67e8f9',
        },
        background: {
          light: '#F8F9FB',
          dark: '#1a1a1a',
        },
        text: {
          light: '#333333',
          dark: '#e5e5e5',
        },
        severity: {
          normal: '#10b981',
          mild: '#fbbf24',
          moderate: '#f97316',
          severe: '#ef4444',
        }
      },
      spacing: {
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
      },
      lineHeight: {
        'body': '140%',
      },
      fontSize: {
        'title': ['48px', { lineHeight: '140%' }],
        'subtitle': ['20px', { lineHeight: '140%' }],
        'body': ['16px', { lineHeight: '140%' }],
        'title-mobile': ['32px', { lineHeight: '140%' }],
        'subtitle-mobile': ['16px', { lineHeight: '140%' }],
      }
    },
  },
  plugins: [],
}
