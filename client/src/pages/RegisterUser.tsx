import React, { useState, useEffect } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, clearError } from "../store/slices/authSlice";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthFooter from "../components/auth/AuthFooter";
import InstrumentSelect from "../components/auth/InstrumentSelect";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(3);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
    instrument?: string;
  }>({});
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
    instrument: "",
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
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle success message and redirect countdown
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    if (registrationSuccess) {
      // Countdown timer for UI feedback
      countdownTimer = setInterval(() => {
        setRedirectSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Actual redirect timer
      redirectTimer = setTimeout(() => {
        navigate("/login");
      }, 3000);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [registrationSuccess, navigate]);

  // Clear form errors when component unmounts
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
    } = {};

    if (!formValues.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formValues.password) {
      errors.password = "Password is required";
    } else if (formValues.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formValues.instrument) {
      errors.instrument = "Please select your instrument";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Dispatch register action and await the result
      const resultAction = await dispatch(registerUser(formValues));

      // Check if the action was fulfilled (registration succeeded)
      if (registerUser.fulfilled.match(resultAction)) {
        console.log("Registration successful!");
        setRegistrationSuccess(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const toggleShowPassword = () => setShowPassword((show) => !show);

  return (
    <AuthLayout>
      <AuthHeader title="Register" subtitle="" />

      {registrationSuccess && (
        <Alert
          severity="success"
          sx={{
            mt: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            Registration successful! Redirecting to login page in{" "}
            {redirectSeconds} seconds...
          </div>
          <CircularProgress size={20} thickness={5} sx={{ ml: 2 }} />
        </Alert>
      )}

      {error && !registrationSuccess && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          opacity: registrationSuccess ? 0.7 : 1,
          pointerEvents: registrationSuccess ? "none" : "auto",
        }}
      >
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

        <InstrumentSelect
          value={formValues.instrument}
          onChange={handleChange}
          error={formErrors.instrument}
        />

        <AuthButton
          text="Register"
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

export default Register;
