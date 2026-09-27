/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9f8',
          100: '#C8E6E2', // Image Swatch 1 (Lightest Mint)
          200: '#9ED5D1', // Image Swatch 2 (Soft Mint)
          300: '#80cac4',
          400: '#63C1BB', // Image Swatch 3 (Vibrant Cyan Teal)
          500: '#4eb0aa',
          600: '#3A9295', // Image Swatch 4 (Deep Sea Teal Primary)
          700: '#26797c',
          800: '#105F68', // Image Swatch 5 (Dark Ocean Teal)
          900: '#0b474e',
          950: '#05292e',
        },
        palette: {
          mintLightest: '#C8E6E2',
          mintLight: '#9ED5D1',
          tealMedium: '#63C1BB',
          tealPrimary: '#3A9295',
          tealDark: '#105F68',
        },
        accent: {
          50: '#f2f9f8',
          100: '#C8E6E2',
          500: '#3A9295',
          600: '#26797c',
          700: '#105F68',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
