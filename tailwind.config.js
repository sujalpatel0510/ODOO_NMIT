/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14213D",
        paper: "#FAF9F6",
        surface: "#FFFFFF",
        slate: "#5B6472",
        border: "#E4E1D8",
        amber: "#D98E04",
        sage: "#4F7965",
        rose: "#B23A48",
        dust: "#9AA0A6",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        md: "8px",
        sm: "6px",
      },
      fontSize: {
        "2xl": ["28px", { lineHeight: "32px" }],
        "xl": ["18px", { lineHeight: "22px" }],
        "lg": ["14px", { lineHeight: "18px" }],
        "base": ["14px", { lineHeight: "20px" }],
        "sm": ["12px", { lineHeight: "16px" }],
        "xs": ["11px", { lineHeight: "14px" }],
      },
      height: {
        "screen": "100vh",
      },
    },
  },
  plugins: [],
}