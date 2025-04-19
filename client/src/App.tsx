import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchCurrentUser } from "./store/slices/authSlice";

// Pages
import Login from "./pages/Login";
import Register from "./pages/RegisterUser";
import RegisterAdmin from "./pages/RegisterAdmin";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Components
import ProtectedRoute from "./components/routing/ProtectedRoute";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector((state) => state.song.isPlaying);
  const isMobileView = useAppSelector((state) => state.ui.isMobileView);

  // Add body class when song is playing (for better mobile scrolling control)
  useEffect(() => {
    if (isMobileView && isPlaying) {
      document.body.classList.add("song-playing");
    } else {
      document.body.classList.remove("song-playing");
    }
  }, [isPlaying, isMobileView]);

  useEffect(() => {
    // Check if we have stored credentials
    const token = localStorage.getItem("jamoveo_token");
    const storedUser = localStorage.getItem("jamoveo_user");

    if (token && storedUser) {
      try {
        // Parse user data
        const user = JSON.parse(storedUser);
        // Set the user in Redux state
        dispatch({
          type: "auth/restoreSession",
          payload: { user, token },
        });

        // Optionally verify the token with backend
        dispatch(fetchCurrentUser());
      } catch (error: unknown) {
        if (error instanceof Error) {
          localStorage.removeItem("jamoveo_token");
          localStorage.removeItem("jamoveo_user");
          throw new Error(error.message);
        } else {
          // If parsing fails, clear localStorage
          localStorage.removeItem("jamoveo_token");
          localStorage.removeItem("jamoveo_user");
          throw new Error("Error parsing user data from localStorage");
        }
      }
    }
  }, [dispatch]);

  return (
    <div style={{ margin: 0, padding: 0, height: "100%", width: "100%" }}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
