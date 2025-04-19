import axios from "axios";
import { clearAuth, getStoredToken } from "./authStorage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token in requests when available
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(new Error(error))
);

// Auth related API calls
export const authAPI = {
  // Regular user registration
  register: async (userData: {
    username: string;
    password: string;
    instrument: string;
  }) => {
    try {
      const response = await api.post("/users/register", userData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Registration error:", error.message);
        throw new Error(error.message);
      } else {
        console.error("Registration error:", error);
        throw new Error("Registration failed");
      }
    }
  },

  // Admin registration
  registerAdmin: async (
    userData: { username: string; password: string; instrument: string },
    adminSecret: string
  ) => {
    try {
      const response = await api.post("/users/admin/register", {
        ...userData,
        adminSecret,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Admin registration error:", error.message);
        throw new Error(error.message);
      } else {
        console.error("Admin registration error:", error);
        throw new Error("Admin registration failed");
      }
    }
  },

  // User login
  login: async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.post("/users/login", credentials);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
        throw new Error(error.message ?? "Login failed");
      } else {
        console.error("Login error:", error);
      }
    }
  },

  // Get current user profile (useful when app loads)
  getCurrentUser: async () => {
    try {
      // Get the username from localStorage
      const userStr = localStorage.getItem("jamoveo_user");
      if (!userStr) {
        console.log("No user in localStorage");
        return null;
      }

      try {
        const user = JSON.parse(userStr);
        const username =
          user.username ?? (typeof user === "string" ? user : null);

        if (!username) {
          console.log("No username found in stored user data");
          return null;
        }

        // Include the username as a query parameter
        const response = await api.get(
          `/users/me?username=${encodeURIComponent(username)}`
        );
        return response.data;
      } catch (parseError) {
        console.error("Error parsing user from localStorage:", parseError);
        return null;
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  },

  // Logout - client side only for now
  logout: () => {
    clearAuth();
  },
};

export default api;
