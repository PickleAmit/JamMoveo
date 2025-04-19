import React from "react";
import { Box } from "@mui/material";
import { useAppSelector } from "../../store/hooks";
import logo from "../../assets/logo.png";
import bgImage from "../../assets/login-bg.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Mobile-only logo */}
      {isMobileView && (
        <Box
          component="img"
          src={logo}
          alt="JamMoveo logo"
          sx={{
            position: "absolute",
            top: "5%",
            left: "5%",
            width: "40dvw",
            height: "5dvh",
            zIndex: 10,
            filter: "brightness(0)",
          }}
        />
      )}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fff",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: isMobileView ? "90vw" : "30dvw",
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Right side with background image - only displayed on non-mobile devices */}
      {!isMobileView && (
        <Box
          sx={{
            flex: 1,
            position: "relative",
          }}
        >
          <Box
            component="img"
            src={bgImage}
            alt="Login background"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "1em 0em 0em 1em",
            }}
          />
          <Box
            component="img"
            src={logo}
            alt="JamMoveo logo"
            sx={{
              position: "absolute",
              bottom: 32,
              right: 32,
              width: "15em",
              height: "5em",
              p: 1,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AuthLayout;
