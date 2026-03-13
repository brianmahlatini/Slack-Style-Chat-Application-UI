/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0f1a",
          900: "#0f1626",
          800: "#182036",
          700: "#202945",
          600: "#2a3559",
          500: "#3a4775",
          400: "#55629a",
          300: "#6b7cc2",
          200: "#8e9ad4",
          100: "#b5bee9"
        },
        lime: {
          500: "#a4f62e",
          600: "#8fdb20"
        },
        ember: {
          500: "#ff7a59",
          600: "#f16543"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(164, 246, 46, 0.2)",
        card: "0 20px 60px rgba(9, 12, 20, 0.35)"
      },
      fontFamily: {
        display: ["Satoshi", "ui-sans-serif", "system-ui"],
        body: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
