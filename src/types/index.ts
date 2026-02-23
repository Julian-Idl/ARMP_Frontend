// ============================================================
// Shared TypeScript Types
// ============================================================

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "REQUESTER" | "APPROVER";
  createdAt: string;
  updatedAt: string;
}

export interface AccessRequest {
  _id: string;
  requester: Pick<User, "_id" | "name" | "email"> | string;
  accessType: string;
  reason: string;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: Pick<User, "_id" | "name" | "email"> | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errorCode: string;
}

export interface DashboardStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "REQUESTER" | "APPROVER";
}

export interface CreateAccessRequestPayload {
  accessType: string;
  reason: string;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface RejectPayload {
  rejectionReason: string;
}
