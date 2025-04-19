import React from "react";
import {
  InputAdornment,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface AuthInputProps {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
  autoComplete?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  isPassword = false,
  showPassword = false,
  toggleShowPassword,
  autoComplete,
}) => {
  const passwordType = showPassword ? "text" : "password";
  return (
    <>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        required
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        type={isPassword ? passwordType : type}
        error={!!error}
        helperText={error}
        autoComplete={autoComplete}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            bgcolor: "#7E6A2514",
            "& fieldset": {
              borderColor: "#BDBDBD",
            },
            "&:hover fieldset": {
              borderColor: "#937100",
            },
            borderRadius: "0.5em",
          },
          backgroundColor: "#7E6A2514",
          borderRadius: "0.5em",
        }}
        InputProps={
          isPassword && toggleShowPassword
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined
        }
      />
    </>
  );
};

export default AuthInput;
