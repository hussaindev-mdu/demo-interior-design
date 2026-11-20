import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --bg-rgb is sampled from frame 1 by `npm run prepare-frames`
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        ink: "rgb(237 232 224 / <alpha-value>)", // #EDE8E0
        gold: "rgb(200 161 101 / <alpha-value>)", // #C8A165
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        lux: "cubic-bezier(0.22, 1, 0.36, 1)",
        "lux-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        800: "800ms",
        1000: "1000ms",
        1200: "1200ms",
        1600: "1600ms",
      },
      letterSpacing: {
        label: "0.28em",
      },
      maxWidth: {
        site: "88rem",
      },
    },
  },
  plugins: [],
};

export default config;
