/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui"],
      },
      colors: {
        ink: "#0a0a0a",
        bone: "#f5f1ea",
        cream: "#faf6ee",
        ember: "#ff5722",
        matcha: "#8db580",
        rust: "#c1440e",
        smoke: "#3a3a3a",
      },
      animation: {
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fadeIn 0.4s ease-out",
        "pulse-ring": "pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "steam": "steam 3s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        steam: {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.4" },
          "50%": { transform: "translateY(-8px) scale(1.1)", opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
