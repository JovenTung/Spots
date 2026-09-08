import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/** Tokens are OKLCH triplets in globals.css; `<alpha-value>` keeps `/opacity`
 *  modifiers working (bg-card/90, shadow-primary/30, text-foreground/80). */
const token = (name: string) => `oklch(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "media",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          solid: token("destructive-solid"),
          foreground: token("destructive-foreground"),
        },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        star: token("star"),
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Fixed rem scale (~1.2 ratio). Phones don't need fluid type.
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        xs: ["0.75rem", { lineHeight: "1.05rem" }],
        sm: ["0.8125rem", { lineHeight: "1.2rem" }],
        base: ["0.9375rem", { lineHeight: "1.4rem" }],
        lg: ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "-0.015em" }],
        xl: ["1.3125rem", { lineHeight: "1.65rem", letterSpacing: "-0.02em" }],
        "2xl": ["1.5rem", { lineHeight: "1.85rem", letterSpacing: "-0.025em" }],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-md)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
      },
      zIndex: {
        header: "30",
        nav: "40",
        overlay: "50",
        toast: "60",
      },
      minHeight: {
        dvh: "100dvh",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s var(--ease-out)",
        "accordion-up": "accordion-up 0.2s var(--ease-out)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
