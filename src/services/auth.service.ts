// ============================================================
// Auth API Functions
// ============================================================

import api from "@/lib/api";
import type {
  ApiResponse,
  AuthData,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types";

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<ApiResponse<AuthData>>("/auth/register", data),

  login: (data: LoginPayload) =>
    api.post<ApiResponse<AuthData>>("/auth/login", data),

  logout: () => api.post<ApiResponse<null>>("/auth/logout"),

  getMe: () => api.get<ApiResponse<{ user: User }>>("/auth/me"),

  refresh: () => api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh"),
};
