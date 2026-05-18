/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          dark:       'hsl(var(--primary-dark))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          dark:       'hsl(var(--secondary-dark))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      borderRadius: {
        xl:  '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        '4xl': '3rem',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        heroZoom: {
          from: { transform: 'scale(1.05)' },
          to:   { transform: 'scale(1.13)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%':     { transform: 'rotate(2deg) scale(1.05)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        heroZoom:    'heroZoom 12s ease-in-out infinite alternate',
        wiggle:      'wiggle 3s ease-in-out infinite',
        fadeSlideUp: 'fadeSlideUp .6s ease both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
