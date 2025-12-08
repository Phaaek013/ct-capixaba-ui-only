import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070b",
        card: {
          DEFAULT: "#0a0d14",
          foreground: "#f9fafb"
        },
        border: "#1a1d24",
        primary: {
          DEFAULT: "#f97316",
          foreground: "#ffffff",
          hover: "#ea580c"
        },
        muted: {
          DEFAULT: "#94a3b8",
          foreground: "#64748b"
        }
      }
    }
  },
  plugins: []
};

export default config;
