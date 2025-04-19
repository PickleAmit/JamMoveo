import React from "react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { useAppSelector } from "../../store/hooks";

interface AuthFooterProps {
  text: string;
  linkText: string;
  onLinkClick: () => void;
}

const AuthFooter: React.FC<AuthFooterProps> = ({
  text,
  linkText,
  onLinkClick,
}) => {
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        mt: isMobileView ? 2 : 0,
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "#757575", fontWeight: "400", opacity: "60%" }}
      >
        {text}
      </Typography>
      <MuiLink
        component="button"
        variant="body2"
        sx={{
          color: "#937100",
          fontWeight: "400",
          textDecoration: "none",
        }}
        onClick={onLinkClick}
        type="button"
      >
        {linkText}
      </MuiLink>
    </Box>
  );
};

export default AuthFooter;
