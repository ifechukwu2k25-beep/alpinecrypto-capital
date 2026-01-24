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
        // AlpineCrypto Capital Brand Colors
        navy: {
          DEFAULT: "#0C1F3A",
          50: "#E6EBF0",
          100: "#CCD7E1",
          200: "#99AFC3",
          300: "#6687A5",
          400: "#335F87",
          500: "#0C1F3A",
          600: "#0A192E",
          700: "#081323",
          800: "#050D17",
          900: "#03060C",
        },
        charcoal: {
          DEFAULT: "#2A2A2A",
          50: "#F5F5F5",
          100: "#EBEBEB",
          200: "#D7D7D7",
          300: "#C3C3C3",
          400: "#6E6E6E",
          500: "#2A2A2A",
          600: "#222222",
          700: "#1A1A1A",
          800: "#111111",
          900: "#090909",
        },
        red: {
          DEFAULT: "#D32027",
          50: "#F9E5E6",
          100: "#F3CBCD",
          200: "#E7979B",
          300: "#DB6369",
          400: "#CF2F37",
          500: "#D32027",
          600: "#A91A1F",
          700: "#7F1317",
          800: "#540D0F",
          900: "#2A0608",
        },
        offwhite: {
          DEFAULT: "#F9F9F9",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      fontSize: {
        "display-1": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-2": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "h1": ["2.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "h2": ["2rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
        "h3": ["1.75rem", { lineHeight: "1.4", fontWeight: "600" }],
        "h4": ["1.5rem", { lineHeight: "1.5", fontWeight: "600" }],
        "h5": ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }],
        "h6": ["1.125rem", { lineHeight: "1.5", fontWeight: "600" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      transitionDuration: {
        "400": "400ms",
      },
    },
  },
  plugins: [],
};
export default config;
