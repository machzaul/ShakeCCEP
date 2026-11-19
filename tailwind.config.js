/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coke: {
          red: "#F40000",
          darkred: "#B30000",
          black: "#0D0D0F",
          dark: "#141419",
          slate: "#E6ECEF",
          pale: "#EFF3F6",
          silver: "#D0D7DE",
        },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "'Impact'", "'Montserrat'", "sans-serif"],
        body: ["'Inter'", "'Segoe UI'", "sans-serif"],
      },
      animation: {
        "pulse-fast": "pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slight": "bounceSlight 1.2s infinite ease-in-out",
        "shake-hint": "shakeHint 0.5s infinite ease-in-out",
      },
      keyframes: {
        bounceSlight: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shakeHint: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-4deg)" },
          "75%": { transform: "rotate(4deg)" },
        },
      },
    },
  },
  plugins: [],
};

