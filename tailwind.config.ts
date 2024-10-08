const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        xs: "480px",
        md: "768px",
        lg: "1240px",
        xl: "1600px",
      },
      margin: {
        15: "3.75rem",
        21: "6.25rem",
        39: "4.75rem",
        84: "21rem",
        88: "21.7rem",
        90: "22.5rem",
        100: "45rem",
        101: "25rem",
        135: "30rem",
        136: "32rem",
        137: "33.75rem",
        138: "34.5rem",
        142: "35.5rem",
        145: "36.25rem",
        148: "37rem",
        152: "38rem",
        197: "36.75rem",
        198: "44.5rem",
        200: "50rem",
        140: "35rem",
        98: "24.5rem",
        192: "43.75rem",
        194: "43rem",
        130: "26rem",
        199: "47.25rem",
        250: "49.75rem",
        251: "50.75rem",
        252: "41.75rem",
        253: "43.75rem",
        254: "58.75rem",
      },
      width: {
        63: "15.75rem",
        97: "24.5rem",
        174: "43.5rem",
        300: "75rem",
        92: "23rem",
        83: "20.75rem",
        162: "40.5rem",
        120: "35rem",
        178: "44.5rem",
        210: "54rem",
        335: "83.75rem",
        200: "30rem",
        250: "66.5rem",
      },
      height: {
        97: "24.5rem",
        174: "43.5rem",
        300: "75rem",
        92: "23rem",
        250: "62.5rem",
        197: "49.25rem",
        200: "54.5rem",
        150: "28.5rem",
        151: "30.5rem",
        280: "70rem",
        240: "60rem",
      },
      gap: {
        42: "10.5rem",
      },
      padding: {
        18: "4.5rem",
        22: "5.5rem",
        "28px": "28px",
        25: "2rem",
        26: "1.5rem",
        27: "1.25rem",
        29: "1",
      },
    },
  },
  plugins: [],
});
