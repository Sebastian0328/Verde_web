import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Aquí irán los colores, tipografías e identidad visual de VERDE
      // cuando el branding esté listo
      colors: {
        brand: {
          // primary: "#...",
          // accent: "#...",
        },
      },
      fontFamily: {
        // sans: ["..."],
      },
    },
  },
  plugins: [],
};

export default config;
