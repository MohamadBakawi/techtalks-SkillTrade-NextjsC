/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app//*.{js,ts,jsx,tsx}",
    "./src/components//*.{js,ts,jsx,tsx}",
    "./src//*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },

        typing: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },

        blink: {
          "50%": { borderColor: "transparent" },
          "100%": { borderColor: "white" },
        },
      },

      animation: {
        fadeIn: "fadeIn 1.2s ease-in-out",
        typing: "typing 2s steps(30), blink .7s infinite",
        pulseFast: "pulse .8s infinite",
      },
    },
  },
  plugins: [],
};