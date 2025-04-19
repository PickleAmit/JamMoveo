import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";

// Types
export interface User {
  id: number;
  username: string;
  role: "user" | "admin";
  instrument?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registerSuccess: boolean;
}

const safeJsonParse = (value: string | null): User | null => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Error parsing JSON from localStorage:", error);
    return null;
  }
};

// Then use it in your initialState
const initialState: AuthState = {
  user: safeJsonParse(localStorage.getItem("jamoveo_user")),
  isAuthenticated: !!localStorage.getItem("jamoveo_token"),
  isLoading: false,
  error: null,
  registerSuccess: false,
};

// Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    {
      credentials,
      rememberMe,
    }: {
      credentials: { username: string; password: string };
      rememberMe: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.login(credentials);

      // Only store in localStorage if rememberMe is true
      if (rememberMe) {
        const user = {
          id: response.id,
          username: response.username,
          role: response.role,
        };

        const token =
          response.token ?? `mock_token_${Date.now()}_${response.username}`;

        localStorage.setItem("jamoveo_token", token);
        localStorage.setItem("jamoveo_user", JSON.stringify(user));
      }

      // Always return the response for Redux state
      return {
        user: {
          id: response.id,
          username: response.username,
          role: response.role,
        },
        token:
          response.token || `mock_token_${Date.now()}_${response.username}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { username: string; password: string; instrument: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.register(userData);
      // Store token and user in localStorage if registration includes auto-login
      // if (response.token) {
      //   localStorage.setItem("jamoveo_token", response.token);
      //   localStorage.setItem("jamoveo_user", JSON.stringify(response.user));
      // }
      return response;
    } catch (error: unknown) {
      const errorAsError = error as Error;
      return rejectWithValue(
        errorAsError.message ?? "Registration failed. Please try again."
      );
    }
  }
);

// Register admin
export const registerAdmin = createAsyncThunk(
  "auth/registerAdmin",
  async (
    {
      userData,
      adminSecret,
    }: {
      userData: { username: string; password: string; instrument: string };
      adminSecret: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.registerAdmin(userData, adminSecret);
      // Store token and user in localStorage if registration includes auto-login
      if (response.token) {
        localStorage.setItem("jamoveo_token", response.token);
        localStorage.setItem("jamoveo_user", JSON.stringify(response.user));
      }
      return response;
    } catch (error: unknown) {
      const errorAsError = error as Error;
      return rejectWithValue(
        errorAsError.message ??
          "Admin registration failed. Please check your credentials."
      );
    }
  }
);

// Get current user
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getCurrentUser();
      return user;
    } catch (error: unknown) {
      const errorAsError = error as Error;
      return rejectWithValue(
        errorAsError.message ?? "Failed to fetch user profile."
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      authAPI.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreSession: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        if (action.payload.token) {
          localStorage.setItem("jamoveo_token", action.payload.token);
          localStorage.setItem(
            "jamoveo_user",
            JSON.stringify(action.payload.user)
          );
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only set user if we get a user back with token (auto login)
        // state.isAuthenticated = true;
        state.registerSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Admin register cases
    builder
      .addCase(registerAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only set user if we get a user back with token (auto login)
        if (action.payload.token) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get current user cases
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        // Clear stored data
        authAPI.logout();
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
