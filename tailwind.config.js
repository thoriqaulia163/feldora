/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        zentry: ["zentry", "sans-serif"],
        general: ["general", "sans-serif"],
        "circular-web": ["circular-web", "sans-serif"],
        "robert-medium": ["robert-medium", "sans-serif"],
        "robert-regular": ["robert-regular", "sans-serif"],
      },
      colors: {
        customBlue: {
          50: "#DFDFF0",
          75: "#dfdff2",
          100: "#F0F2FA",
          200: "#010101",
          300: "#4FB7DD",
        },
        customViolet: {
          300: "#5724ff",
        },
        customPurple: {
          100: "#d9dbff",
          300: "#7d69f5",
          400: "#6f4deb",
          500: "#673de6",
          900: "#110c29",
        },
        customYellow: {
          100: "#8e983f",
          200: "#CCFF00",
          300: "#edff66",
        },
      },
    },
  },
  plugins: [],
}