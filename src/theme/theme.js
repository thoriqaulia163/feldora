import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#001C37", // Primary color
      100: "#001C37",
      90: "#00325A",
      80: "#006493",
      70: "#0474A8",
      60: "#2092C8",
      50: "#49AEDE",
      40: "#80CCEF",
      30: "#A8DEF8",
      20: "#E6F2FF",
      10: "#F5FCFF",
    },
    secondary: {
      main: "#101C2B", // Secondary color
      100: "#101C2B",
      90: "#253141",
      80: "#3C4858",
      70: "#535F70",
      60: "#6C788A",
      50: "#8592A4",
      40: "#BBC7DB",
      30: "#D7E3F8",
      20: "#EAF1FF",
      10: "#FDFCFF",
    },
    tertiary: {
      main: "#150066", // Tertiary color
      100: "#150066",
      90: "#2C217A",
      80: "#433A91",
      70: "#5B52AB",
      60: "#746CC6",
      50: "#8E86E2",
      40: "#C6C0FF",
      30: "#E4DFFF",
      20: "#F3EEFF",
      10: "#FFFBFF",
    },
    neutral: {
      main: "#1C1B1F", // Neutral color
      100: "#1C1B1F",
      90: "#2F3033",
      80: "#45474A",
      70: "#5D5E61",
      60: "#76777A",
      50: "#909094",
      40: "#E3E2E6",
      30: "#F1F0F4",
      20: "#FDFCFF",
      10: "#FFFFFF",
    },
    danger: {
      main: "#BA1A1A", // Danger color
      accent: "#FFEDEA",
      mainHover: "#EA2B2B",
      accentHover: "#FFE0DB",
    },
    warning: {
      main: "#EEA604", // Warning color
      accent: "#FFF7E4",
      mainHover: "#FAB61D",
      accentHover: "#FFF2D2",
    },
    success: {
      main: "#007A0D", // Success color
      accent: "#D6FFDA",
      mainHover: "#089016",
      accentHover: "#C1FFC8",
    },
    gradient: {
      primary: "linear-gradient(90deg, #0474A8 0%, #0459A8 100%)",
      mixed: "linear-gradient(90deg, #3584CE 0%, #503894 100%)",
      softMixed: "linear-gradient(90deg, #58AEFF 0%, #6F72FF 100%)",
      dark: "linear-gradient(90deg, #2F3033 0%, #5D5E61 100%)",
      gold: "-webkit-linear-gradient(0deg, #FFC933 0%, #BC8A00 100%)",
      silver: "-webkit-linear-gradient(0deg, #939AA1 0%, #54585D 100%)",
    },
  },

  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      fontSize: "36px", // Mobile font size for h1
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
    },
    h2: {
      fontSize: "32px", // Mobile font size for h2
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
    },
    h3: {
      fontSize: "28px", // Mobile font size for h3
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
    },
    h4: {
      fontSize: "24px", // Mobile font size for h4
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
    },
    h5: {
      fontSize: "20px", // Mobile font size for h5
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
    },
    h6: {
      fontSize: "18px", // Mobile font size for h6
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
    },
    boldLargeText: {
      fontSize: "16px", // Mobile font size for boldLargeText
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
      display: "block",
    },
    regularLargeText: {
      fontSize: "16px", // Mobile font size for regularLargeText
      fontWeight: "400",
      lineHeight: "120%",
      letterSpacing: "-1%",
      display: "block",
    },
    multilineLargeText: {
      fontSize: "16px", // Mobile font size for multilineLargeText
      fontWeight: "400",
      lineHeight: "150%",
      letterSpacing: "-1%",
      display: "block",
    },
    boldMediumText: {
      fontSize: "14px", // Mobile font size for boldMediumText
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
      display: "block",
    },
    regularMediumText: {
      fontSize: "14px", // Mobile font size for regularMediumText
      fontWeight: "400",
      lineHeight: "120%",
      letterSpacing: "-1%",
      display: "block",
    },
    multilineMediumText: {
      fontSize: "14px", // Mobile font size for multilineMediumText
      fontWeight: "400",
      lineHeight: "150%",
      letterSpacing: "-1%",
      display: "block",
    },
    boldSmallText: {
      fontSize: "12px", // Mobile font size for boldSmallText
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
      "@media (min-width: 960px)": {
        fontSize: "14px", // Desktop font size for boldSmallText
      },
      display: "block",
    },
    regularSmallText: {
      fontSize: "12px", // Mobile font size for regularSmallText
      fontWeight: "400",
      lineHeight: "120%",
      letterSpacing: "-1%",
      display: "block",
    },
    multilineSmallText: {
      fontSize: "12px", // Mobile font size for multilineSmallText
      fontWeight: "400",
      lineHeight: "150%",
      letterSpacing: "-1%",
      display: "block",
    },
    boldMiniText1: {
      fontSize: "11px", // Mobile font size for boldSmallText
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
      display: "block",
    },
    regularMiniText1: {
      fontSize: "11px", // Mobile font size for regularSmallText
      fontWeight: "400",
      lineHeight: "120%",
      letterSpacing: "-1%",
      display: "block",
    },
    multilineMiniText1: {
      fontSize: "11px", // Mobile font size for multilineSmallText
      fontWeight: "400",
      lineHeight: "150%",
      letterSpacing: "-1%",
      display: "block",
    },
    boldMiniText2: {
      fontSize: "10px", // Mobile font size for boldSmallText
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
      display: "block",
    },
    regularMiniText2: {
      fontSize: "10px", // Mobile font size for regularSmallText
      fontWeight: "400",
      lineHeight: "120%",
      letterSpacing: "-1%",
      display: "block",
    },
    multilineMiniText2: {
      fontSize: "10px", // Mobile font size for multilineSmallText
      fontWeight: "400",
      lineHeight: "150%",
      letterSpacing: "-1%",
      display: "block",
    },
    boldMiniText3: {
      fontSize: "9px", // Mobile font size for boldSmallText
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
      display: "block",
    },
    regularMiniText3: {
      fontSize: "9px", // Mobile font size for regularSmallText
      fontWeight: "400",
      lineHeight: "120%",
      letterSpacing: "-1%",
      display: "block",
    },
    multilineMiniText3: {
      fontSize: "9px", // Mobile font size for multilineSmallText
      fontWeight: "400",
      lineHeight: "150%",
      letterSpacing: "-1%",
      display: "block",
    },
    boldMiniText4: {
      fontSize: "8px", // Mobile font size for boldSmallText
      fontWeight: "600",
      lineHeight: "140%",
      letterSpacing: "-1%",
      display: "block",
    },
    regularMiniText4: {
      fontSize: "8px", // Mobile font size for regularSmallText
      fontWeight: "400",
      lineHeight: "120%",
      letterSpacing: "-1%",
      display: "block",
    },
    multilineMiniText4: {
      fontSize: "8px", // Mobile font size for multilineSmallText
      fontWeight: "400",
      lineHeight: "150%",
      letterSpacing: "-1%",
      display: "block",
    },
  },
});

export default theme;
