"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAppSelector, useAppDispatch } from "@/hooks/useAppStore";
import { selectIsAuthenticated, selectIsAdmin, fetchMeThunk } from "@/store/slices/authSlice";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Routes that require ADMIN role
const ADMIN_ONLY_ROUTES = ["/packets", "/reports", "/settings"];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [isChecking, setIsChecking] = useState(true);

  // Initialize WebSocket connection when authenticated
  useWebSocket(isAuthenticated);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated) {
          // Attempt to fetch user profile using stored token or httpOnly cookie
          const res = await dispatch(fetchMeThunk());
          if (fetchMeThunk.rejected.match(res)) {
            // Not authenticated, redirect to login
            router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
            return;
          }
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, dispatch, router, pathname]);

  // Route Guard: block non-admin users from admin-only pages
  useEffect(() => {
    if (!isChecking && isAuthenticated && !isAdmin) {
      const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
      if (isAdminRoute) {
        toast.error("Bạn không có quyền truy cập trang này");
        router.replace("/dashboard");
      }
    }
  }, [isChecking, isAuthenticated, isAdmin, pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
