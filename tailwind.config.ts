import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: "#0A0A0B",
        raised: "#111113",
        ink: "#161618",
        paper: "#F2F0EB",
        primary: "#F4F4F5",
        secondary: "#A1A1AA",
        muted: "#71717A",
        hairline: "rgba(255, 255, 255, 0.10)",
        "glass-fill": "rgba(255, 255, 255, 0.05)",
        "glass-border": "rgba(255, 255, 255, 0.12)",
        ember: {
          DEFAULT: "#FF6B2C",
          hover: "#FF8149",
          glow: "rgba(255, 107, 44, 0.35)",
          dark: "#E05315",
          soft: "rgba(255, 107, 44, 0.12)",
        },
        bronze: {
          1: "#F2D7B6",
          2: "#B98A5E",
          3: "#6B4A33",
        },
        status: {
          success: "#34D399",
          warning: "#FBBF24",
          danger: "#F87171",
          info: "#5EC8DA",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 50px -10px rgba(255, 107, 44, 0.35)",
        "glow-sm": "0 0 25px -5px rgba(255, 107, 44, 0.25)",
        "glow-lg": "0 0 100px 10px rgba(255, 107, 44, 0.3)",
        glass: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 60px rgba(0, 0, 0, 0.35)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        marquee: "marquee 35s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
