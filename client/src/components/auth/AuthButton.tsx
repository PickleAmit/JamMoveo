import React from "react";
import { useAppSelector } from "../../store/hooks";
import { Button } from "@mui/material";

interface AuthButtonProps {
  text: string;
  isLoading: boolean;
  loadingText?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  fullWidth?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  text,
  isLoading,
  loadingText = "Loading...",
  type = "submit",
  onClick,
  fullWidth = true,
}) => {
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);

  return (
    <Button
      type={type}
      variant="contained"
      fullWidth={fullWidth}
      disabled={isLoading}
      onClick={onClick}
      sx={{
        bgcolor: "#FFCD29",
        color: "black",
        fontWeight: 600,
        py: isMobileView ? 1 : 1.2,
        mb: 2,
        "&:hover": { bgcolor: "#bfa13a" },
        fontFamily: "Exo, sans-serif",
        borderRadius: "0.5em",
        textTransform: "none",
      }}
    >
      {isLoading ? loadingText : text}
    </Button>
  );
};

export default AuthButton;
