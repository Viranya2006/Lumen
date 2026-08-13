import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0D10",
        foreground: "#F2F3F4",
        surface: {
          DEFAULT: "#15181C",
          hover: "#1C2025",
          active: "#242930",
          border: "#22262B",
          subtle: "#101316",
        },
        muted: {
          DEFAULT: "#1A1E24",
          foreground: "#9AA0A6",
        },
        accent: {
          DEFAULT: "#D4A650", // Warm amber
          hover: "#E5B864",
          muted: "rgba(212, 166, 80, 0.12)",
          foreground: "#0B0D10",
        },
        teal: {
          DEFAULT: "#2DD4BF", // Sharp teal
          hover: "#5EEAD4",
          muted: "rgba(45, 212, 191, 0.12)",
          foreground: "#0B0D10",
        },
        danger: {
          DEFAULT: "#E2564E",
          hover: "#EF4444",
          muted: "rgba(226, 86, 78, 0.12)",
          foreground: "#F2F3F4",
        },
        border: "#22262B",
        input: "#22262B",
        ring: "#D4A650",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
