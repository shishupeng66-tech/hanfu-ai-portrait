"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

export function TopBar({
  isSidebarOpen,
  onToggleSidebar,
}: {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const locale = useLocale();
  const pathname = usePathname();

  // Map pathname to page title
  const getPageTitle = () => {
    const pathMap: Record<string, string> = {
      [`/${locale}/dashboard`]: locale === "zh" ? "仪表板" : "Dashboard",
      [`/${locale}/generate`]: locale === "zh" ? "创作" : "Generate",
      [`/${locale}/credits`]: locale === "zh" ? "积分" : "Credits",
      [`/${locale}/pricing`]: locale === "zh" ? "订阅" : "Subscription",
      [`/${locale}/settings`]: locale === "zh" ? "设置" : "Settings",
      [`/${locale}/profile`]: locale === "zh" ? "个人资料" : "Profile",
    };
    return pathMap[pathname] || "";
  };

  const workspaceName = locale === "zh" ? "汉韵写真" : "Han Portrait";
  const pageTitle = getPageTitle();

  return (
    <div
      className="h-14 flex items-center px-4 justify-between shrink-0"
      style={{
        background: "#1B120E",
        borderBottom: "1px solid rgba(232, 194, 122, 0.10)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: "rgba(255, 247, 236, 0.5)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232, 194, 122, 0.1)";
            e.currentTarget.style.color = "#E8C27A";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255, 247, 236, 0.5)";
          }}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} />
          ) : (
            <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
          )}
        </button>
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "rgba(255, 247, 236, 0.5)" }}
        >
          <span className="truncate">{workspaceName}</span>
          <span>/</span>
          <span
            className="font-medium truncate"
            style={{ color: "#FFF7EC" }}
          >
            {pageTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search placeholder */}
        <div
          className="w-64 h-8 rounded-md hidden md:block"
          style={{ background: "rgba(255, 247, 236, 0.05)" }}
        />
        {/* User avatar placeholder */}
        <div
          className="w-8 h-8 rounded-full border"
          style={{
            background: "rgba(232, 194, 122, 0.1)",
            borderColor: "rgba(232, 194, 122, 0.2)",
          }}
        />
      </div>
    </div>
  );
}
