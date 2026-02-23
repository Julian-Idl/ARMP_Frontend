// ============================================================
// Guest Route — Redirects to dashboard if already authenticated
// ============================================================

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function GuestRoute() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const redirectPath =
      user.role === "APPROVER" ? "/approver" : "/requester";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
