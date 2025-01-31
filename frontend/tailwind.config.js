/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(to bottom, rgb(3, 7, 18), rgb(17, 24, 39), rgb(3, 7, 18))',
      },
      colors: {
        gray: {
          950: 'rgb(3, 7, 18)',
        },
      },
    },
  },
  plugins: [],
}
