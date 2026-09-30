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
        brand: {
          orange: "#F97316",
          gold: "#FBBF24",
        },
        primary: {
          DEFAULT: "#C2410C",
          hover: "#9A3412",
          light: "#FFF7ED",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
        },
        secondary: {
          DEFAULT: "#0EA5E9",
          hover: "#0284C7",
          light: "#F0F9FF",
          500: "#0EA5E9",
          600: "#0284C7",
        },
        accent: {
          DEFAULT: "#B45309",
          hover: "#92400E",
          light: "#FEF3C7",
          500: "#FBBF24",
          600: "#B45309",
        },
        surface: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          muted: "#F1F5F9",
          border: "#E2E8F0",
        },
        content: {
          title: "#0F172A",
          body: "#334155",
          muted: "#64748B",
        }
      },
      borderRadius: {
        'card': '1.25rem', // 20px
        'card-sm': '1rem',  // 16px
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
        'card': '0 4px 20px rgba(15, 23, 42, 0.05), 0 1px 4px rgba(15, 23, 42, 0.02)',
        'elevated': '0 10px 30px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
};
export default config;
