import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        vivo: {
          50: "#effdf6",
          100: "#d9fbe8",
          200: "#b5f5d1",
          300: "#78e9ad",
          400: "#35d682",
          500: "#12b96a",
          600: "#079655",
          700: "#087746",
          800: "#0a5e3a",
          900: "#0a4d31"
        },
        ink: {
          950: "#080a09",
          900: "#101412",
          800: "#171d1a"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(5, 10, 8, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
