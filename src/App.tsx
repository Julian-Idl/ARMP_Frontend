// ============================================================
// App - React Router Configuration
// ============================================================

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import RequesterDashboard from "@/pages/RequesterDashboard";
import ApproverDashboard from "@/pages/ApproverDashboard";
import { Loader2 } from "lucide-react";

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Guest-only routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated routes */}
      <Route element={<AppLayout />}>
        <Route
          path="/requester"
          element={
            <ProtectedRoute allowedRoles={["REQUESTER"]}>
              <RequesterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approver"
          element={
            <ProtectedRoute allowedRoles={["APPROVER"]}>
              <ApproverDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all: redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
