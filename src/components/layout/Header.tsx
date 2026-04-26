"use client";

import { useAppSelector } from "@/hooks/useAppStore";
import { selectUser } from "@/store/slices/authSlice";
import { ThemeToggle } from "./ThemeToggle";
import { Bell } from "lucide-react";

export function Header() {
  const user = useAppSelector(selectUser);

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
      <div className="w-full flex-1">
        {/* Can put a global search or breadcrumbs here */}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">{user?.username || "Guest"}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase() || ""}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
