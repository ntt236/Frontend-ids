"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import {
  fetchAlerts,
  selectAlerts,
  selectAlertFilters,
  selectTotalElements,
  selectAlertStatus,
  selectTotalPages,
  setFilters,
  deleteAlert,
  updateAlertStatus,
} from "@/store/slices/alertSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATTACK_TYPES, ALERT_STATUSES, SEVERITY_CONFIG, STATUS_CONFIG, ATTACK_TYPE_CONFIG } from "@/lib/constants";
import { formatDateTime, truncateText } from "@/lib/formatters";
import { MoreHorizontal, ShieldCheck, ShieldOff, Trash2, Eye } from "lucide-react";
import { selectIsAdmin } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function AlertsPage() {
  const dispatch = useAppDispatch();
  const alerts = useAppSelector(selectAlerts);
  const filters = useAppSelector(selectAlertFilters);
  const totalElements = useAppSelector(selectTotalElements);
  const totalPages = useAppSelector(selectTotalPages);
  const status = useAppSelector(selectAlertStatus);
  const isAdmin = useAppSelector(selectIsAdmin);

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch, filters.page, filters.size, filters.status, filters.alertType]);

  const handleStatusChange = (value: string) => {
    dispatch(setFilters({ status: value, page: 0 }));
  };

  const handleTypeChange = (value: string) => {
    dispatch(setFilters({ alertType: value, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      dispatch(setFilters({ page: newPage }));
    }
  };

  const onUpdateStatus = async (id: number, newStatus: string) => {
    const res = await dispatch(updateAlertStatus({ id, body: { status: newStatus } }));
    if (updateAlertStatus.fulfilled.match(res)) {
      toast.success(`Alert marked as ${newStatus}`);
    } else {
      toast.error("Failed to update alert status");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;
    const res = await dispatch(deleteAlert(id));
    if (deleteAlert.fulfilled.match(res)) {
      toast.success("Alert deleted");
    } else {
      toast.error("Failed to delete alert");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
        <div className="text-sm text-muted-foreground">
          Total Alerts: <span className="font-medium text-foreground">{totalElements}</span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <CardTitle>Alert Management</CardTitle>
            <div className="flex gap-2">
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {ALERT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.alertType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {ATTACK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="max-w-[300px]">Message</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status === "loading" ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No alerts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-mono text-xs">{alert.id}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${ATTACK_TYPE_CONFIG[alert.alertType]?.color || "bg-muted"}`}>
                          {alert.alertType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            alert.severity === "CRITICAL" ? "destructive" :
                            alert.severity === "HIGH" ? "warning" :
                            alert.severity === "MEDIUM" ? "secondary" : "outline"
                          }
                          className={SEVERITY_CONFIG[alert.severity]?.pulse ? "animate-pulse" : ""}
                        >
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_CONFIG[alert.status]?.color}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={alert.message}>
                        {truncateText(alert.message, 60)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(alert.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/alerts/${alert.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            {isAdmin && alert.status === "OPEN" && (
                              <>
                                <DropdownMenuItem onClick={() => onUpdateStatus(alert.id, "RESOLVED")}>
                                  <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" /> Mark Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdateStatus(alert.id, "IGNORED")}>
                                  <ShieldOff className="mr-2 h-4 w-4 text-muted-foreground" /> Mark Ignored
                                </DropdownMenuItem>
                              </>
                            )}
                            {isAdmin && (
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(alert.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Alert
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing page {filters.page + 1} of {totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
