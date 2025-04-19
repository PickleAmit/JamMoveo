import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: ["Exo", "Arial", "sans-serif"].join(","),
    body1: {
      fontFamily: "Exo, sans-serif",
    },
    body2: {
      fontFamily: "Exo, sans-serif",
    },
    h1: {
      fontFamily: "Exo, sans-serif",
    },
    h2: {
      fontFamily: "Exo, sans-serif",
    },
    h3: {
      fontFamily: "Exo, sans-serif",
    },
    h4: {
      fontFamily: "Exo, sans-serif",
    },
    h5: {
      fontFamily: "Exo, sans-serif",
    },
    h6: {
      fontFamily: "Exo, sans-serif",
    },
    button: {
      fontFamily: "Exo, sans-serif",
    },
  },
  palette: {
    primary: {
      main: "#937100",
    },
    secondary: {
      main: "#FFCD29",
    },
  },
});

export default theme;
