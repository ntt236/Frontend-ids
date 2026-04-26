"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/hooks/useAppStore";
import { selectAlerts, selectUnreadCount } from "@/store/slices/alertSlice";
import { selectWsStatus } from "@/store/slices/wsSlice";
import { ATTACK_TYPE_CONFIG, SEVERITY_CONFIG } from "@/lib/constants";
import { formatDateTime } from "@/lib/formatters";
import { Activity, ShieldAlert, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";

export default function LiveMonitorPage() {
  const alerts = useAppSelector(selectAlerts);
  const wsStatus = useAppSelector(selectWsStatus);
  const unreadCount = useAppSelector(selectUnreadCount);
  
  const [autoScroll, setAutoScroll] = useState(true);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Take the most recent 50 alerts from Redux store for the live feed
  const liveFeedAlerts = [...alerts].slice(0, 50);

  useEffect(() => {
    if (autoScroll && feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveFeedAlerts, autoScroll]);

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Live Monitor</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2 py-1.5 px-4 bg-background">
            {wsStatus === "connected" ? (
              <Wifi className="h-4 w-4 text-emerald-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <span className={wsStatus === "connected" ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
              {wsStatus === "connected" ? "Live Stream Active" : "Disconnected"}
            </span>
          </Badge>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={setAutoScroll}
            />
            <Label htmlFor="auto-scroll">Auto-scroll</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 shrink-0">
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-500">Connection Status</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 capitalize">{wsStatus}</h3>
            </div>
            <Activity className="h-8 w-8 text-emerald-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-500">New Alerts Since Login</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{unreadCount}</h3>
            </div>
            <ShieldAlert className="h-8 w-8 text-blue-500/50" />
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-300">
        <CardHeader className="bg-zinc-900 border-b border-zinc-800 py-3 shrink-0">
          <CardTitle className="text-sm font-mono flex items-center gap-2 text-zinc-100">
            <span className="relative flex h-3 w-3">
              {wsStatus === "connected" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${wsStatus === "connected" ? "bg-emerald-500" : "bg-red-500"}`}></span>
            </span>
            Terminal Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0 font-mono text-sm">
          <div className="p-4 space-y-1">
            {liveFeedAlerts.length === 0 ? (
              <div className="text-zinc-500 italic">Waiting for incoming alerts...</div>
            ) : (
              liveFeedAlerts.slice().reverse().map((alert) => {
                const isCritical = alert.severity === "CRITICAL";
                const isHigh = alert.severity === "HIGH";
                const rowClass = isCritical
                  ? "bg-red-950/40 text-red-400 border-l-2 border-red-500"
                  : isHigh
                  ? "bg-orange-950/20 text-orange-400 border-l-2 border-orange-500"
                  : "text-zinc-400 border-l-2 border-zinc-700 hover:bg-zinc-900/50";

                return (
                  <div key={alert.id} className={`px-3 py-2 flex flex-col md:flex-row md:items-center gap-2 group transition-colors ${rowClass}`}>
                    <div className="w-[180px] shrink-0 text-zinc-500">
                      [{formatDateTime(alert.createdAt)}]
                    </div>
                    <div className="w-[100px] shrink-0 font-bold">
                      {alert.severity}
                    </div>
                    <div className="w-[80px] shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        isCritical ? "bg-red-500/20 text-red-300" : 
                        isHigh ? "bg-orange-500/20 text-orange-300" : "bg-zinc-800"
                      }`}>
                        {alert.alertType}
                      </span>
                    </div>
                    <div className="flex-1 truncate">
                      {alert.message}
                    </div>
                    <Link href={`/alerts/${alert.id}`} className="opacity-0 group-hover:opacity-100 text-xs underline shrink-0 transition-opacity">
                      View Details
                    </Link>
                  </div>
                );
              })
            )}
            <div ref={feedEndRef} className="h-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
