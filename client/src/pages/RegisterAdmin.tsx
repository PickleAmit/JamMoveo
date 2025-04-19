import React, { useState, useEffect } from "react";
import { Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerAdmin, clearError } from "../store/slices/authSlice";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthFooter from "../components/auth/AuthFooter";

const RegisterAdmin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
    instrument?: string;
    adminSecret?: string;
  }>({});
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
    instrument: "",
    adminSecret: "",
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get auth state from Redux
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Redirect to login after successful registration
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    if (registrationSuccess) {
      redirectTimer = setTimeout(() => {
        navigate("/login");
      }, 3000); // Redirect after 3 seconds
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [registrationSuccess, navigate]);

  // Clear form errors when Redux error changes
  useEffect(() => {
    return () => {
      // Clear any auth errors when component unmounts
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Clear field-specific errors when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }

    // Clear Redux error when typing
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors: {
      username?: string;
      password?: string;
      instrument?: string;
      adminSecret?: string;
    } = {};

    if (!formValues.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formValues.password) {
      errors.password = "Password is required";
    } else if (formValues.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formValues.adminSecret) {
      errors.adminSecret = "Admin secret is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const { adminSecret, ...userData } = formValues;

    try {
      // Dispatch admin register action and await the result
      const resultAction = await dispatch(
        registerAdmin({ userData, adminSecret })
      );

      // Check if the action was fulfilled (registration succeeded)
      if (registerAdmin.fulfilled.match(resultAction)) {
        setRegistrationSuccess(true);
      }
    } catch (error) {
      console.error("Admin registration error:", error);
    }
  };

  const toggleShowPassword = () => setShowPassword((show) => !show);

  return (
    <AuthLayout>
      <AuthHeader title="Admin Registration" subtitle="" />

      {registrationSuccess && (
        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
          Admin registration successful! Redirecting to login page...
        </Alert>
      )}

      {error && !registrationSuccess && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <AuthInput
          label="Enter your username*"
          name="username"
          placeholder="Username"
          value={formValues.username}
          onChange={handleChange}
          error={formErrors.username}
          autoComplete="username"
        />

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
          autoComplete="new-password"
        />

        <AuthInput
          label="Admin Secret*"
          name="adminSecret"
          placeholder="Enter admin secret"
          value={formValues.adminSecret}
          onChange={handleChange}
          error={formErrors.adminSecret}
          isPassword
          showPassword={showPassword}
          toggleShowPassword={toggleShowPassword}
        />

        <AuthButton
          text="Register as Admin"
          isLoading={isLoading}
          loadingText="Registering..."
        />
      </Box>

      <AuthFooter
        text="Already have an account?"
        linkText="Log in"
        onLinkClick={() => navigate("/login")}
      />
    </AuthLayout>
  );
};

export default RegisterAdmin;
