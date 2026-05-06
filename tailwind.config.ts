import type { Config } from "tailwindcss";

const cssVar = (name: string) => `var(--${name})`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: cssVar("bg-canvas"),
        app: cssVar("bg-app"),
        subtle: cssVar("bg-subtle"),
        muted: cssVar("bg-muted"),
        hover: cssVar("bg-hover"),
        inset: cssVar("bg-inset"),
        border: {
          subtle: cssVar("border-subtle"),
          DEFAULT: cssVar("border-default"),
          strong: cssVar("border-strong"),
          focus: cssVar("border-focus"),
        },
        text: {
          primary: cssVar("text-primary"),
          secondary: cssVar("text-secondary"),
          tertiary: cssVar("text-tertiary"),
          disabled: cssVar("text-disabled"),
          inverse: cssVar("text-inverse"),
        },
        accent: {
          DEFAULT: cssVar("accent"),
          hover: cssVar("accent-hover"),
          soft: cssVar("accent-soft"),
          border: cssVar("accent-border"),
          deep: cssVar("accent-deep"),
          cyan: cssVar("accent-cyan"),
        },
        success: { DEFAULT: cssVar("success"), soft: cssVar("success-soft"), border: cssVar("success-border") },
        warn: { DEFAULT: cssVar("warn"), soft: cssVar("warn-soft"), border: cssVar("warn-border") },
        danger: { DEFAULT: cssVar("danger"), soft: cssVar("danger-soft"), border: cssVar("danger-border") },
        info: { DEFAULT: cssVar("info"), soft: cssVar("info-soft"), border: cssVar("info-border") },
        agent: { DEFAULT: cssVar("agent"), soft: cssVar("agent-soft"), border: cssVar("agent-border") },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },
      borderRadius: {
        sm: cssVar("radius-sm"),
        DEFAULT: cssVar("radius"),
        lg: cssVar("radius-lg"),
      },
      boxShadow: {
        1: "0 1px 0 rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
        2: "0 1px 0 rgba(0,0,0,0.02), 0 4px 14px rgba(0,0,0,0.06)",
        pop: "0 8px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)",
      },
      keyframes: {
        spin: { to: { transform: "rotate(360deg)" } },
        "pulse-soft": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.55" } },
      },
      animation: {
        spin: "spin 0.8s linear infinite",
        "pulse-soft": "pulse-soft 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
