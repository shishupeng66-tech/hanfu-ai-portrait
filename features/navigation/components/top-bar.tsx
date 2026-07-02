"use client";

import { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CreditsBadge } from "@/components/ui/credits-badge";
import { UserMenu } from "@/features/navigation/components/user-menu";
import { NotificationDropdown } from "@/features/navigation/components/notification-dropdown";
import { getSubscriptionPlanDisplayInfo } from "@/lib/account-settings";
import type { ClientUserProfile, UserProfileResponse } from "@/lib/client-api";

export function TopBar({
  isSidebarOpen,
  onToggleSidebar,
}: {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const session = useSession();
  const isLoggedIn = !!session.data?.user;
  const [userProfile, setUserProfile] = useState<ClientUserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch user profile with subscription info
  useEffect(() => {
    if (!isLoggedIn || userProfile || loadingProfile) return;

    const fetchUserProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = (await response.json()) as UserProfileResponse;
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile in top-bar:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn, userProfile, loadingProfile]);

  const planDisplayInfo = getSubscriptionPlanDisplayInfo(
    userProfile?.subscription?.planKey,
    locale
  );

  // Map pathname to page title
  const getPageTitle = () => {
    const pathMap: Record<string, string> = {
      [`/${locale}/dashboard`]: locale === "zh" ? "首页" : "Home",
      [`/${locale}/generate`]: locale === "zh" ? "创作" : "Generate",
      [`/${locale}/credits`]: locale === "zh" ? "积分" : "Credits",
      [`/${locale}/pricing`]: locale === "zh" ? "订阅" : "Subscription",
      [`/${locale}/settings`]: locale === "zh" ? "设置" : "Settings",
      [`/${locale}/profile`]: locale === "zh" ? "个人资料" : "Profile",
      [`/${locale}/notifications`]: locale === "zh" ? "通知中心" : "Notifications",
    };
    return pathMap[pathname] || "";
  };

  const workspaceName = locale === "zh" ? "汉韵写真" : "Han Portrait";
  const pageTitle = getPageTitle();

  return (
    <div
      className="h-14 flex items-center px-4 justify-between shrink-0"
      style={{
        background: "#0B0B0D",
        borderBottom: "1px solid rgba(255, 247, 236, 0.08)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: "rgba(255, 247, 236, 0.45)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232, 194, 122, 0.10)";
            e.currentTarget.style.color = "#E8C27A";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255, 247, 236, 0.45)";
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
          style={{ color: "rgba(255, 247, 236, 0.45)" }}
        >
          <span className="truncate">{workspaceName}</span>
          <span>/</span>
          <span
            className="font-medium truncate"
            style={{ color: "rgba(255, 247, 236, 0.92)" }}
          >
            {pageTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDropdown />

        <LanguageSwitcher variant="navbarIcon" />

        <CreditsBadge
          credits={userProfile?.credits ?? 0}
          locale={locale}
          planName={planDisplayInfo.displayNameShort}
        />

        <UserMenu variant="navbar" />
      </div>
    </div>
  );
}
