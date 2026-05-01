"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_CONFIG, STATUS_CONFIG, ATTACK_TYPE_CONFIG } from "@/lib/constants";
import { formatDateTime, formatBytes, formatConfidence } from "@/lib/formatters";
import { ArrowLeft, AlertTriangle, Package, Clock, ShieldCheck, ShieldOff } from "lucide-react";
import { alertService } from "@/services/api";
import { useAppSelector } from "@/hooks/useAppStore";
import { selectIsAdmin } from "@/store/slices/authSlice";
import { toast } from "sonner";
import type { AlertResponse, PacketResponse } from "@/types";

interface AlertDetail extends AlertResponse {
  packet?: PacketResponse | null;
}

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isAdmin = useAppSelector(selectIsAdmin);
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const alertId = Number(params.id);

  useEffect(() => {
    const fetchAlert = async () => {
      setIsLoading(true);
      try {
        const res = await alertService.getById(alertId);
        setAlert(res.data as AlertDetail);
      } catch {
        toast.error("Alert not found");
        router.replace("/alerts");
      } finally {
        setIsLoading(false);
      }
    };
    if (alertId) fetchAlert();
  }, [alertId, router]);

  const onUpdateStatus = async (newStatus: string) => {
    if (!alert) return;
    try {
      await alertService.updateStatus(alert.id, newStatus);
      setAlert({ ...alert, status: newStatus });
      toast.success(`Alert marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update alert status");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!alert) return null;

  const sevConfig = SEVERITY_CONFIG[alert.severity];
  const statusConfig = STATUS_CONFIG[alert.status];
  const typeConfig = ATTACK_TYPE_CONFIG[alert.alertType];

  return (
    <div className="space-y-6">
      {/* Back button & title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alert #{alert.id}</h1>
          <p className="text-sm text-muted-foreground">Created {formatDateTime(alert.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Alert Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alert Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${typeConfig?.color || "bg-muted"}`}>
                  {alert.alertType}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</p>
                <Badge
                  variant={
                    alert.severity === "CRITICAL" ? "destructive" :
                    alert.severity === "HIGH" ? "warning" :
                    alert.severity === "MEDIUM" ? "secondary" : "outline"
                  }
                  className={`mt-1 ${sevConfig?.pulse ? "animate-pulse" : ""}`}
                >
                  {alert.severity}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <Badge variant="outline" className={`mt-1 ${statusConfig?.color}`}>
                  {alert.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Packet ID</p>
                <p className="mt-1 font-mono text-sm">{alert.packetId}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</p>
              <p className="mt-1 text-sm leading-relaxed bg-muted/50 rounded-lg p-3">{alert.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDateTime(alert.createdAt)}</p>
                </div>
              </div>
              {alert.resolvedAt && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                    <p className="text-sm">{formatDateTime(alert.resolvedAt)}</p>
                  </div>
                </div>
              )}
              {alert.resolvedBy && (
                <div>
                  <p className="text-xs text-muted-foreground">Resolved By</p>
                  <p className="text-sm font-medium">{alert.resolvedBy}</p>
                </div>
              )}
            </div>

            {/* Admin action buttons */}
            {isAdmin && alert.status === "OPEN" && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onUpdateStatus("RESOLVED")}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> Mark Resolved
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus("IGNORED")}
                >
                  <ShieldOff className="mr-2 h-4 w-4" /> Mark Ignored
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Packet Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Related Packet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alert.packet ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source IP</p>
                    <p className="mt-1 font-mono text-sm">{alert.packet.sourceIp}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Destination IP</p>
                    <p className="mt-1 font-mono text-sm">{alert.packet.destIp}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Protocol</p>
                    <Badge variant="outline" className="mt-1">{alert.packet.protocol}</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</p>
                    <p className="mt-1 text-sm">{formatBytes(alert.packet.size)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prediction</p>
                    <Badge variant={alert.packet.label === "normal" ? "success" : "destructive"} className="mt-1">
                      {alert.packet.label.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence</p>
                    <p className={`mt-1 text-sm font-medium ${
                      alert.packet.confidence > 0.9 ? "text-emerald-500" :
                      alert.packet.confidence > 0.7 ? "text-amber-500" : "text-destructive"
                    }`}>
                      {formatConfidence(alert.packet.confidence)}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Captured At</p>
                  <p className="mt-1 text-sm">{formatDateTime(alert.packet.capturedAt)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No related packet information available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
