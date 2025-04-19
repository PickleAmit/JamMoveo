import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthFooter from "../components/auth/AuthFooter";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearError, loginUser } from "../store/slices/authSlice";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated");
      // Redirect to the appropriate dashboard based on user role
      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Clear errors when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const validateForm = () => {
    const errors: {
      username?: string;
      password?: string;
    } = {};

    if (!formValues.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formValues.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRememberMeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRememberMe(event.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    dispatch(loginUser({ credentials: formValues, rememberMe }))
      .then(() => {
        navigate("/dashboard");
      })
      .catch((error) => {
        setFormErrors({ general: error.message });
      });
  };

  const toggleShowPassword = () => setShowPassword((show) => !show);

  return (
    <AuthLayout>
      <AuthHeader title="Log in" />

      {formErrors.general && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {formErrors.general || error}
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <AuthInput
            label="Enter your username*"
            name="username"
            placeholder="Username"
            value={formValues.username}
            onChange={handleChange}
            error={formErrors.username}
            autoComplete="username"
          />
        </Box>

        <AuthInput
          label="Enter your password*"
          name="password"
          placeholder="Password"
          value={formValues.password}
          onChange={handleChange}
          error={formErrors.password}
          isPassword
          showPassword={showPassword}
          toggleShowPassword={toggleShowPassword}
          autoComplete="current-password"
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                size="small"
                checked={rememberMe}
                onChange={handleRememberMeChange}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.8em",
                  color: "#0D0B0C",
                  fontWeight: "300",
                }}
              >
                Remember me
              </Typography>
            }
            sx={{ m: 0 }}
          />
          <Typography
            variant="body2"
            component="button"
            onClick={() => alert("Forgot password flow")}
            sx={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#0D0B0C",
              fontWeight: "300",
              fontSize: "0.8em",
              textDecoration: "none",
              fontFamily: "Exo, sans-serif",
            }}
          >
            Forgot password?
          </Typography>
        </Box>

        <AuthButton
          text="Log in"
          isLoading={isLoading}
          loadingText="Logging in..."
        />
      </Box>

      <AuthFooter
        text="Don't have an account?"
        linkText="Register"
        onLinkClick={() => navigate("/register")}
      />
    </AuthLayout>
  );
};

export default Login;
