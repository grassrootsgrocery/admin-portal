/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pumpkinOrange: "#e65402",
        newLeafGreen: "#094343",
        softBeige: "#fffef9",
        softGrayWhite: "#e0deca",
        zestedLime: "#cfdf83",
        simpleBrown: "#2e2d2b",
        simpleGray: "#c4c4c4",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp"), require("tailwindcss-animate")],
};
