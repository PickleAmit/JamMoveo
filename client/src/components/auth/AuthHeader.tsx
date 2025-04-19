import React from "react";
import { Box, Typography } from "@mui/material";
import { useAppSelector } from "../../store/hooks";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h4"
        fontWeight={400}
        fontSize={"1.2rem"}
        color="#6E6D6D"
        ml={isMobileView ? 0 : "1em"}
        sx={{ opacity: "60%" }}
      >
        Welcome to Jamoveo
      </Typography>
      <Typography
        variant="h6"
        fontWeight={600}
        fontSize={isMobileView ? "2.5rem" : "3rem"}
        sx={{ color: "#937100" }}
        ml={isMobileView ? 0 : "0.5em"}
      >
        {title}
      </Typography>
      {subtitle && <Typography variant="body1">{subtitle}</Typography>}
    </Box>
  );
};

export default AuthHeader;
