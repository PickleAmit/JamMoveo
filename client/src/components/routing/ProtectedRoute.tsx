import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  // Simple loading indicator
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user isn't loaded yet, show loading
  if (!user) {
    return <div>Loading user data...</div>;
  }

  // If role check is needed and role doesn't match, redirect
  if (requiredRole && user.role !== requiredRole) {
    const redirectPath =
      user.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
