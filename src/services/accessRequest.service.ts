// ============================================================
// Access Request API Functions
// ============================================================

import api from "@/lib/api";
import type {
  ApiResponse,
  AccessRequest,
  Pagination,
  CreateAccessRequestPayload,
  RejectPayload,
  DashboardStats,
} from "@/types";

export const accessRequestApi = {
  // REQUESTER: Create a new access request
  create: (data: CreateAccessRequestPayload) =>
    api.post<ApiResponse<{ request: AccessRequest }>>("/access-requests", data),

  // REQUESTER: Get own requests
  getMyRequests: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ requests: AccessRequest[]; pagination: Pagination }>>(
      "/access-requests/my",
      { params }
    ),

  // APPROVER: Get all requests
  getAllRequests: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ requests: AccessRequest[]; pagination: Pagination }>>(
      "/access-requests",
      { params }
    ),

  // Get single request by ID
  getById: (id: string) =>
    api.get<ApiResponse<{ request: AccessRequest }>>(`/access-requests/${id}`),

  // APPROVER: Approve
  approve: (id: string) =>
    api.patch<ApiResponse<{ request: AccessRequest }>>(
      `/access-requests/${id}/approve`
    ),

  // APPROVER: Reject (with mandatory reason)
  reject: (id: string, data: RejectPayload) =>
    api.patch<ApiResponse<{ request: AccessRequest }>>(
      `/access-requests/${id}/reject`,
      data
    ),

  // APPROVER: Dashboard stats
  getStats: () =>
    api.get<ApiResponse<{ stats: DashboardStats }>>("/access-requests/stats"),
};
