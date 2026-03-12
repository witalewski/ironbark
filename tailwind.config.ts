import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["ui-monospace", "Courier New", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0",
      },
    },
  },
  plugins: [],
}
export default config
