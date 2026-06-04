import conf from "@openbb/ui/tailwind.config";
import type { Config } from "tailwindcss";

// OpenBB reference design color scales
const light = {
  50: "#f7f8f9",
  100: "#f3f4f7",
  200: "#ebecf0",
  300: "#d6dce5",
  400: "#d0d5dd",
  500: "#9da5b2",
  600: "#667085",
  700: "#485468",
  750: "#3d4758",
  800: "#354055",
  850: "#1e2939",
  900: "#0f1828",
};

// Backward-compatible alias
const grey = light;

const dark = {
  50: "#8a8a90",
  100: "#6d6e74",
  200: "#5a5961",
  300: "#505059",
  400: "#46464f",
  500: "#36363f",
  600: "#303038",
  700: "#2a2a31",
  750: "#24242a",
  800: "#212127",
  850: "#1c1b20",
  900: "#151518",
};

const lightBlue = {
  50: "#ECF7FF",
  100: "#CCEEFF",
  200: "#99DDFF",
  300: "#66CCFF",
  400: "#33BBFF",
  500: "#00AAFF",
  600: "#0088CC",
  700: "#006699",
  800: "#004466",
  900: "#002D48",
};

const darkBlue = {
  50: "#F2F7FB",
  100: "#CCDEEE",
  200: "#99BEDD",
  300: "#669DCB",
  400: "#337DBA",
  500: "#005CA9",
  600: "#004A87",
  700: "#003765",
  800: "#002544",
  900: "#000E21",
};

const purple = {
  50: "#F6F4F8",
  100: "#DAD4E5",
  200: "#B6A9CB",
  300: "#917DB0",
  400: "#6D5296",
  500: "#48277C",
  600: "#3A1F63",
  700: "#2B174A",
  800: "#1D1032",
  900: "#16082C",
};

const burgundy = {
  50: "#F3E9EF",
  100: "#E6D4DF",
  200: "#CDA8C0",
  300: "#B47DA0",
  400: "#9B5181",
  500: "#822661",
  600: "#681E4E",
  700: "#4E173A",
  800: "#340F27",
  900: "#200415",
};

const cardinal = {
  50: "#F9EBED",
  100: "#F3D6DA",
  200: "#E6ADB5",
  300: "#DA8490",
  400: "#CD5B6B",
  500: "#C13246",
  600: "#9A2838",
  700: "#741E2A",
  800: "#4D141C",
  900: "#34070D",
};

const ruby = {
  50: "#FCF5F6",
  100: "#FACCD8",
  200: "#F499B0",
  300: "#EF6689",
  400: "#E93361",
  500: "#E4003A",
  600: "#B6002E",
  700: "#890023",
  800: "#5B0017",
  900: "#3F0009",
};

const orange = {
  50: "#FEF9F2",
  100: "#FCE5CC",
  200: "#F9CB99",
  300: "#F5B166",
  400: "#F29733",
  500: "#EF7D00",
  600: "#BF6400",
  700: "#8F4B00",
  800: "#603200",
  900: "#421E00",
};

const yellow = {
  50: "#FEFDF2",
  100: "#FFFBCC",
  200: "#FFF466",
  300: "#FFF466",
  400: "#FFF133",
  500: "#FFED00",
  600: "#CCBE00",
  700: "#998E00",
  800: "#665F00",
  900: "#2E2A00",
};

const ai = {
  50: "#F0EBF9",
  100: "#E2D7F3",
  200: "#C5AFE7",
  300: "#9974D6",
  400: "#7C4CCA",
  500: "#6D38C4",
  600: "#6232B0",
  700: "#4C2789",
  800: "#371C62",
  900: "#21113B",
};

const danger = {
  50: "#FEF2F2",
  100: "#FEE2E2",
  200: "#FECACA",
  300: "#FCA5A5",
  400: "#F87171",
  500: "#EF4444",
  600: "#DC2626",
  700: "#B91C1C",
  800: "#991B1B",
  900: "#7F1D1D",
};

const warning = {
  50: "#FFF7ED",
  100: "#FFEDD5",
  200: "#FED7AA",
  300: "#FDBA74",
  400: "#FB923C",
  500: "#F97316",
  600: "#EA580C",
  700: "#C2410C",
  800: "#9A3412",
  900: "#7C2D12",
};

const success = {
  50: "#F0FDF4",
  100: "#DCFCE7",
  200: "#BBF7D0",
  300: "#86EFAC",
  400: "#4ADE80",
  500: "#22C55E",
  600: "#16A34A",
  700: "#15803D",
  800: "#166534",
  900: "#14532D",
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./node_modules/@openbb/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [conf],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        light,
        grey,
        dark,
        "light-blue": lightBlue,
        "dark-blue": darkBlue,
        purple,
        burgundy,
        cardinal,
        ruby,
        orange,
        yellow,
        ai,
        danger,
        warning,
        success,
        info: lightBlue,
        red: danger,
        green: success,
        brand: {
          main: "#0088CC",
          lighter: "#4dacdb",
          darker: "#005f8f",
        },
      },
      boxShadow: {
        "light-1": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "light-2":
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "light-3":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "light-4":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "light-5":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "light-6": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "dark-1": "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        "dark-2":
          "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        "dark-3":
          "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        "dark-4":
          "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
        "dark-5":
          "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
        "dark-6": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      },
    },
  },
} satisfies Config;
