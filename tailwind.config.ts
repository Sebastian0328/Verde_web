import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          bosque: "#2E4F20",
          platano: "#509234",
        },
        oro: "#FFBC23",
        crema: "#F5EDD8",
        tierra: "#9A4F0D",
        negro: "#1A1A1A",
      },
      fontFamily: {
        sans: ["var(--font-arimo)", "Arial", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.9s ease-out forwards",
        "step-in": "stepIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        stepIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
