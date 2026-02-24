import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "warm-white": "#FAFAF8",
        sage: {
          50: "#F0F5F0",
          100: "#E1EBE1",
          200: "#C3D7C3",
          300: "#A5C3A5",
          400: "#87AF87",
          500: "#5B8C5A",
          600: "#4A7249",
          700: "#3A5938",
          800: "#293F27",
          900: "#192616",
        },
        terracotta: {
          50: "#FDF2EE",
          100: "#FBE5DD",
          200: "#F6CABB",
          300: "#F2B099",
          400: "#D47856",
          500: "#C45C3E",
          600: "#A34B32",
          700: "#823A27",
          800: "#612A1B",
          900: "#401A10",
        },
        "warm-amber": {
          50: "#FBF6EB",
          100: "#F7EDD7",
          200: "#EFDAAF",
          300: "#E7C887",
          400: "#DFB65F",
          500: "#D4A030",
          600: "#AD8327",
          700: "#86651E",
          800: "#5F4815",
          900: "#382A0C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
