import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@emotion/react";
import theme from "./theme.ts";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { CssBaseline } from "@mui/material";
import ResponsiveProvider from "./components/ResponsiveProvider.tsx";

const exoFontLink = document.createElement("link");
exoFontLink.rel = "stylesheet";
exoFontLink.href =
  "https://fonts.googleapis.com/css2?family=Exo:wght@300;400;500;600;700&display=swap";
document.head.appendChild(exoFontLink);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ResponsiveProvider>
          <App />
        </ResponsiveProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
