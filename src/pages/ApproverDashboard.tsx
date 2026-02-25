// ============================================================
// Approver Dashboard
// - Stats overview cards
// - View all requests with filtering
// - Approve / Reject with rejection reason dialog
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  rejectionSchema,
  createApproverSchema,
  type RejectionFormData,
  type CreateApproverFormData,
} from "@/lib/validations";
import { accessRequestApi } from "@/services/accessRequest.service";
import { authApi } from "@/services/auth.service";
import type { AccessRequest, DashboardStats } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Filter,
  AlertTriangle,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

const statusConfig: Record<string, { variant: "default" | "success" | "destructive" | "warning"; icon: React.ElementType }> = {
  PENDING: { variant: "warning", icon: Clock },
  APPROVED: { variant: "success", icon: CheckCircle },
  REJECTED: { variant: "destructive", icon: XCircle },
};

const urgencyConfig: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
  CRITICAL: "destructive",
};

export default function ApproverDashboard() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AccessRequest | null>(null);
  const [showCreateApprover, setShowCreateApprover] = useState(false);
  const [createApproverError, setCreateApproverError] = useState<string | null>(null);
  const [createApproverSuccess, setCreateApproverSuccess] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirm, setShowNewConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset: resetRejection,
    formState: { errors: rejErrors, isSubmitting: rejecting },
  } = useForm<RejectionFormData>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: { rejectionReason: "" },
  });

  const {
    register: registerApprover,
    handleSubmit: handleApproverSubmit,
    reset: resetApprover,
    formState: { errors: approverErrors, isSubmitting: creatingApprover },
  } = useForm<CreateApproverFormData>({
    resolver: zodResolver(createApproverSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onCreateApprover = async (data: CreateApproverFormData) => {
    try {
      setCreateApproverError(null);
      setCreateApproverSuccess(null);
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "APPROVER",
      });
      setCreateApproverSuccess(`Approver account created for ${data.email}`);
      resetApprover();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to create approver");
      setCreateApproverError(msg);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await accessRequestApi.getAllRequests(params);
      const list: AccessRequest[] = res.data.data.requests ?? [];
      setRequests(list);
    } catch {
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await accessRequestApi.getStats();
      setStats(res.data.data.stats);
    } catch {
      // Stats are optional — don't block the page
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await accessRequestApi.approve(id);
      await Promise.all([fetchData(), fetchStats()]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (data: RejectionFormData) => {
    if (!rejectTarget) return;
    try {
      setActionLoading(rejectTarget._id);
      await accessRequestApi.reject(rejectTarget._id, data);
      setRejectTarget(null);
      resetRejection();
      await Promise.all([fetchData(), fetchStats()]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approver Dashboard</h1>
          <p className="text-muted-foreground">Review and manage access requests</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchData();
              fetchStats();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowCreateApprover(true);
              setCreateApproverError(null);
              setCreateApproverSuccess(null);
            }}
          >
            <UserPlus className="h-4 w-4" />
            Add Approver
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Separator />

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter:</span>
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Request List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No requests found</h3>
          <p className="text-sm text-muted-foreground">
            {statusFilter !== "ALL"
              ? `No ${statusFilter.toLowerCase()} requests at the moment.`
              : "No access requests have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const statusCfg = statusConfig[req.status] ?? statusConfig.PENDING;
            const StatusIcon = statusCfg.icon;
            const isPending = req.status === "PENDING";
            const isActioning = actionLoading === req._id;

            return (
              <Card key={req._id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{req.accessType}</h3>
                        <Badge variant={urgencyConfig[req.urgency] ?? "default"}>
                          {req.urgency}
                        </Badge>
                        <Badge variant={statusCfg.variant} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.reason}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          By:{" "}
                          <strong>
                            {typeof req.requester === "object" ? req.requester.name : "User"}
                          </strong>{" "}
                          (
                          {typeof req.requester === "object" ? req.requester.email : ""}
                          )
                        </span>
                        <span>
                          {new Date(req.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {req.status === "REJECTED" && req.rejectionReason && (
                        <div className="mt-2 rounded-md bg-destructive/5 p-2 text-sm text-destructive">
                          <strong>Rejection reason:</strong> {req.rejectionReason}
                        </div>
                      )}
                      {req.reviewedBy && req.reviewedAt && (
                        <p className="text-xs text-muted-foreground">
                          Reviewed by{" "}
                          {typeof req.reviewedBy === "object" ? req.reviewedBy.name : "Approver"} on{" "}
                          {new Date(req.reviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req._id)}
                          disabled={isActioning}
                        >
                          {isActioning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectTarget(req)}
                          disabled={isActioning}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Approver Dialog */}
      <Dialog
        open={showCreateApprover}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateApprover(false);
            resetApprover();
            setCreateApproverError(null);
            setCreateApproverSuccess(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Approver Account</DialogTitle>
            <DialogDescription>
              Create a new approver account. The user can log in immediately with these credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApproverSubmit(onCreateApprover)}>
            <div className="space-y-4 py-4">
              {createApproverError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {createApproverError}
                </div>
              )}
              {createApproverSuccess && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                  {createApproverSuccess}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="approver-name">Full Name</Label>
                <Input
                  id="approver-name"
                  placeholder="Jane Doe"
                  {...registerApprover("name")}
                  disabled={creatingApprover}
                />
                {approverErrors.name && (
                  <p className="text-sm text-destructive">{approverErrors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="approver-email">Email</Label>
                <Input
                  id="approver-email"
                  type="email"
                  placeholder="approver@example.com"
                  {...registerApprover("email")}
                  disabled={creatingApprover}
                />
                {approverErrors.email && (
                  <p className="text-sm text-destructive">{approverErrors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="approver-password">Password</Label>
                <div className="relative">
                  <Input
                    id="approver-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerApprover("password")}
                    disabled={creatingApprover}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {approverErrors.password && (
                  <p className="text-sm text-destructive">{approverErrors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="approver-confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="approver-confirm"
                    type={showNewConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerApprover("confirmPassword")}
                    disabled={creatingApprover}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewConfirm(!showNewConfirm)}
                  >
                    {showNewConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {approverErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{approverErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateApprover(false);
                  resetApprover();
                  setCreateApproverError(null);
                  setCreateApproverSuccess(null);
                }}
              >
                Close
              </Button>
              <Button type="submit" disabled={creatingApprover}>
                {creatingApprover ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            resetRejection();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting the access request for{" "}
              <strong>{rejectTarget?.accessType}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleReject)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Explain why this request is being rejected..."
                  rows={4}
                  {...register("rejectionReason")}
                  disabled={rejecting}
                />
                {rejErrors.rejectionReason && (
                  <p className="text-sm text-destructive">
                    {rejErrors.rejectionReason.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectTarget(null);
                  resetRejection();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={rejecting}>
                {rejecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
