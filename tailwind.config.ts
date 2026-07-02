import type { Config } from "tailwindcss";

// CDVRS design tokens
// bg-void:    #0A0B0D  near-black, faint blue tint — main background
// bg-panel:   #131519  raised surfaces (cards, sidebar)
// bg-panel-2: #1B1E24  hover / nested surfaces
// line:       #23262C  hairline borders
// text-hi:    #F3F4F1  warm off-white, primary text
// text-lo:    #8A8F98  muted secondary text
// blue:       #2E5CFF  CDVRS signature electric blue (CTAs, links, active states)
// sun:        #FF7A3D  Southbound sunset orange (sparingly — badges, "hot", exclusive)
// red:        #FF4D4D  sold / destructive

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0B0D",
        panel: "#131519",
        panel2: "#1B1E24",
        line: "#23262C",
        hi: "#F3F4F1",
        lo: "#8A8F98",
        blue: "#2E5CFF",
        sun: "#FF7A3D",
        red: "#FF4D4D",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(46,92,255,0.4), 0 0 24px rgba(46,92,255,0.25)",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blink: "blink 1.6s ease-in-out infinite",
        rise: "rise 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
