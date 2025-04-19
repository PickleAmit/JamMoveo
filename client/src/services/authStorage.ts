// authStorage.ts - Helper functions for auth storage management

import { User } from "../store/slices/authSlice";

// Constants for localStorage keys
const TOKEN_KEY = "jamoveo_token";
const USER_KEY = "jamoveo_user";

/**
 * Safely parse JSON from localStorage
 */
export const safeJsonParse = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);

    // If there was an error, remove the corrupted value
    localStorage.removeItem(key);

    return defaultValue;
  }
};

/**
 * Get user from localStorage
 */
export const getStoredUser = (): User | null => {
  return safeJsonParse<User | null>(USER_KEY, null);
};

/**
 * Get auth token from localStorage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store authentication information
 */
export const storeAuth = (token: string, user: User): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error storing auth data:", error);
  }
};

/**
 * Clear authentication information
 */
export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated based on stored data
 */
export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};
