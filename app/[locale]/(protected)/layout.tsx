"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmailVerifiedGuard } from "@/features/auth/components/email-verified-guard";
import { AppSidebar } from "@/features/navigation/components/app-sidebar";
import { TopBar } from "@/features/navigation/components/top-bar";

export default function ProtectedLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const SIDEBAR_WIDTH = 260;

  return (
    <EmailVerifiedGuard requireEmailVerification={true}>
      <div className="flex min-h-screen">
        <AppSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div
          className="flex-1 flex flex-col transition-[margin] duration-300 ease-out"
          style={{ marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0 }}
        >
          <TopBar
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1">
            {props.children}
          </main>
        </div>
      </div>
    </EmailVerifiedGuard>
  );
}
