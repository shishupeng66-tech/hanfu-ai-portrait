"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/features/navigation/components/user-menu";
import { Shield } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-8 py-3 gap-6">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-foreground">汉韵写真后台</h1>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500/70 border border-amber-500/20">
            管理员
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
