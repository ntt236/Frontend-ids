"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, FileText, LayoutDashboard, Package, Settings, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { logoutThunk, selectIsAdmin, selectUser } from "@/store/slices/authSlice";
import { selectUnreadCount } from "@/store/slices/alertSlice";
import { selectIsWsConnected, selectWsStatus } from "@/store/slices/wsSlice";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Monitor", href: "/live-monitor", icon: Activity },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle, badge: "alerts" },
  { name: "Packets", href: "/packets", icon: Package, adminOnly: true },
  { name: "Reports", href: "/reports", icon: FileText, adminOnly: true },
  { name: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const unreadAlerts = useAppSelector(selectUnreadCount);
  const isWsConnected = useAppSelector(selectIsWsConnected);
  const wsStatus = useAppSelector(selectWsStatus);

  // Filter navigation items based on user role
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-14 lg:h-[60px] items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Activity className="h-5 w-5" />
          NetSentinel
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
                {item.badge === "alerts" && unreadAlerts > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground animate-pulse">
                    {unreadAlerts > 99 ? "99+" : unreadAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2 mb-4 px-2 text-sm">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isWsConnected ? "bg-emerald-500" : wsStatus === "connecting" ? "bg-amber-500" : "bg-destructive"
            )}
          />
          <span className="text-muted-foreground capitalize">
            {wsStatus === "connecting" ? "Connecting WS..." : isWsConnected ? "WS Connected" : "WS Disconnected"}
          </span>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
