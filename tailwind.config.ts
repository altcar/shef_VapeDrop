import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050B09",
        surface: "#0C1613",
        elevated: "#122019",
        line: "rgba(255,255,255,0.08)",
        lime: "#C7FF3D",
        mint: "#2CE0A7",
        sky: "#61C9FF",
        clay: "#FF8A5B",
      },
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["GeistMono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(199,255,61,0.35), 0 18px 40px -18px rgba(199,255,61,0.55)",
        card: "0 24px 60px -32px rgba(0,0,0,0.9)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise .45s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
