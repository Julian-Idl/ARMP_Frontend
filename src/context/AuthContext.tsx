// ============================================================
// Auth Context — Global authentication state management
// Provides user info, login, register, logout across the app
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, LoginPayload, RegisterPayload } from "@/types";
import { authApi } from "@/services/auth.service";
import { isAxiosError } from "axios";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getMe();
      setUser(response.data.data.user);
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (data: LoginPayload) => {
    try {
      const response = await authApi.login(data);
      const { user, accessToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      setUser(user);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Login failed. Please try again."
        );
      }
      throw error;
    }
  };

  const register = async (data: RegisterPayload) => {
    try {
      const response = await authApi.register(data);
      const { user, accessToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      setUser(user);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Registration failed. Please try again."
        );
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Still clear local state even if API fails
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
