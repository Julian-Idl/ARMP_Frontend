// ============================================================
// Requester Dashboard
// - Create new access request (React Hook Form + Zod)
// - View own requests with status badges
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accessRequestSchema, type AccessRequestFormData } from "@/lib/validations";
import { accessRequestApi } from "@/services/accessRequest.service";
import type { AccessRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
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

export default function RequesterDashboard() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccessRequestFormData>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: { accessType: "", reason: "", urgency: "MEDIUM" },
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await accessRequestApi.getMyRequests();
      const list: AccessRequest[] = res.data.data.requests ?? [];
      setRequests(list);
      setHasPending(list.some((r) => r.status === "PENDING"));
    } catch {
      setError("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onSubmit = async (data: AccessRequestFormData) => {
    try {
      setFormError(null);
      await accessRequestApi.create(data);
      reset();
      setShowForm(false);
      await fetchRequests();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit request");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Access Requests</h1>
          <p className="text-muted-foreground">Submit and track your access requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            disabled={hasPending}
            title={hasPending ? "You already have a pending request" : undefined}
          >
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {hasPending && !showForm && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          You already have a pending request. You can submit a new one after it&apos;s reviewed.
        </div>
      )}

      {/* Create Request Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Access Request</CardTitle>
            <CardDescription>Fill in the details for your access request</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {formError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="accessType">Access Type</Label>
                <Input
                  id="accessType"
                  placeholder="e.g. VPN Access, Database Read, Admin Panel"
                  {...register("accessType")}
                  disabled={isSubmitting}
                />
                {errors.accessType && (
                  <p className="text-sm text-destructive">{errors.accessType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you need this access..."
                  rows={4}
                  {...register("reason")}
                  disabled={isSubmitting}
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">{errors.reason.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <select
                  id="urgency"
                  {...register("urgency")}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                {errors.urgency && (
                  <p className="text-sm text-destructive">{errors.urgency.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                    setFormError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <Separator />

      {/* Request List */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No requests yet</h3>
          <p className="text-sm text-muted-foreground">
            Click &ldquo;New Request&rdquo; to submit your first access request.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const statusCfg = statusConfig[req.status] ?? statusConfig.PENDING;
            const StatusIcon = statusCfg.icon;

            return (
              <Card key={req._id}>
                <CardContent className="flex items-start justify-between gap-4 pt-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{req.accessType}</h3>
                      <Badge variant={urgencyConfig[req.urgency] ?? "default"}>
                        {req.urgency}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{req.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(req.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {req.status === "REJECTED" && req.rejectionReason && (
                      <div className="mt-2 rounded-md bg-destructive/5 p-2 text-sm text-destructive">
                        <strong>Rejection reason:</strong> {req.rejectionReason}
                      </div>
                    )}
                    {req.reviewedBy && req.reviewedAt && (
                      <p className="text-xs text-muted-foreground">
                        Reviewed by {typeof req.reviewedBy === "object" ? req.reviewedBy.name : "Approver"}{" "}
                        on {new Date(req.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusCfg.variant} className="flex items-center gap-1 shrink-0">
                    <StatusIcon className="h-3 w-3" />
                    {req.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
