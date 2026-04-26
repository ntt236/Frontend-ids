"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchDashboardStats, selectDashboardStats, selectDashboardStatus } from "@/store/slices/dashboardSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  Package,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { ATTACK_TYPE_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { format } from "date-fns";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectDashboardStats);
  const status = useAppSelector(selectDashboardStatus);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const isLoading = status === "loading" || !stats;

  // Prepare data for charts
  const alertsByTypeData = Object.entries(stats?.alertsByType || {}).map(([name, value]) => ({
    name,
    value,
    color: ATTACK_TYPE_CONFIG[name]?.color.match(/text-(\w+-\d+)/)?.[1] || "gray-500", // Basic color extraction
  }));

  const alertsBySeverityData = Object.entries(stats?.alertsBySeverity || {}).map(([name, value]) => ({
    name,
    value,
    fill: SEVERITY_CONFIG[name]?.color.includes("red") ? "#ef4444" : 
          SEVERITY_CONFIG[name]?.color.includes("orange") ? "#f97316" :
          SEVERITY_CONFIG[name]?.color.includes("yellow") ? "#eab308" : "#22c55e",
  }));

  const timelineData = (stats?.alertTimeline || []).map((pt) => ({
    date: format(new Date(pt.date), "MMM dd"),
    count: pt.count,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        {!isLoading && (
          <Badge
            variant={
              stats.systemStatus === "NORMAL"
                ? "success"
                : stats.systemStatus === "WARNING"
                ? "warning"
                : "destructive"
            }
            className="text-sm px-4 py-1"
          >
            System: {stats.systemStatus}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Packets"
          value={stats?.totalPackets}
          icon={Package}
          loading={isLoading}
        />
        <StatCard
          title="Total Alerts"
          value={stats?.totalAlerts}
          icon={Activity}
          loading={isLoading}
        />
        <StatCard
          title="Open Alerts"
          value={stats?.openAlerts}
          icon={ShieldAlert}
          loading={isLoading}
          valueColor="text-destructive"
        />
        <StatCard
          title="Resolved Alerts"
          value={stats?.resolvedAlerts}
          icon={CheckCircle}
          loading={isLoading}
          valueColor="text-emerald-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Alert Timeline (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Alerts by Attack Type</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={alertsByTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {alertsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Alerts by Severity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={alertsBySeverityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  valueColor,
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  loading: boolean;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className={`text-2xl font-bold ${valueColor || ""}`}>
            {value?.toLocaleString() || "0"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
