"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LocaleLink } from "@/components/locale-link";
import { 
  Sparkles, 
  Image, 
  Coins, 
  Crown,
  ChevronLeft,
  ChevronRight,
  Home,
  CreditCard
} from "lucide-react";

const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 82;

// Custom icon component for consistency with generate page
function Icon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const icons: Record<string, React.ReactNode> = {
    "image-grid": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    "flame": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.2-.7-2-1.5-3-1.4-1.7-2-2.5-2-4 0-1.3.6-2.4 1.5-3-.5 1.5.5 3 2 4" />
        <path d="M12 22s6-3.5 6-9a6 6 0 0 0-12 0c0 5.5 6 9 6 9Z" />
      </svg>
    ),
    "trending-up": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
    "sparkles": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
      </svg>
    ),
    "crown": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 19h20l-1.5-11L16 11l-4-7-4 7L3.5 8 2 19Z" />
      </svg>
    ),
    "coins": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" />
        <path d="m16.71 13.88.7.71-2.82 2.82" />
      </svg>
    ),
    "home": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    "credit-card": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  };

  const icon = icons[name];
  if (!icon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <span className={className} style={style}>
      {icon}
    </span>
  );
}

export function AppSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const sidebarCollapsed = false; // Temporarily disable collapse

  const sidebarGroups = useMemo(
    () => [
      {
        groupKey: "main",
        title: locale === "zh" ? "主要" : "Main",
        items: [
          {
            id: "dashboard",
            label: locale === "zh" ? "仪表板" : "Dashboard",
            icon: "home",
            href: `/${locale}/dashboard`,
          },
          {
            id: "generate",
            label: locale === "zh" ? "创作" : "Generate",
            icon: "sparkles",
            href: `/${locale}/generate`,
          },
          {
            id: "gallery",
            label: locale === "zh" ? "作品" : "Gallery",
            icon: "image-grid",
            href: `/${locale}/generate`, // TODO: update to actual gallery page
          },
        ],
      },
      {
        groupKey: "billing",
        title: locale === "zh" ? "账单" : "Billing",
        items: [
          {
            id: "credits",
            label: locale === "zh" ? "积分" : "Credits",
            icon: "coins",
            href: `/${locale}/credits`,
          },
          {
            id: "subscription",
            label: locale === "zh" ? "订阅" : "Subscription",
            icon: "crown",
            href: `/${locale}/pricing?tab=membership`,
          },
        ],
      },
    ],
    [locale]
  );

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-40 flex flex-col border-r transition-[width] duration-300 ease-out"
      style={{
        width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        background: "#241812",
        borderColor: "rgba(232, 194, 122, 0.12)",
      }}
    >
      {/* Brand Area */}
      <div
        className="flex items-center px-5 border-b"
        style={{
          height: 72,
          borderColor: "rgba(232, 194, 122, 0.10)",
        }}
      >
        <LocaleLink
          href="/"
          className="flex items-center flex-1 min-w-0"
          style={{ gap: 12 }}
        >
          <img
            src="/brand/logo-mark.png"
            alt="Han Portrait Logo"
            className="object-contain flex-shrink-0"
            style={{ height: 38, width: 38 }}
          />
          {!sidebarCollapsed && (
            locale === "zh" ? (
              <span
                className="font-bold tracking-[-0.01em] truncate"
                style={{ fontSize: 19, color: "#E8C27A" }}
              >
                汉韵写真
              </span>
            ) : (
              <div
                className="font-bold tracking-[-0.01em] truncate"
                style={{ fontSize: 19 }}
              >
                <span className="text-[#FFF7EC]">Han</span>
                <span className="text-[#E8C27A]"> Portrait</span>
              </div>
            )
          )}
        </LocaleLink>


      </div>

      {/* Menu Scroll Area */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {sidebarGroups.map((group) => (
          <div key={group.groupKey} className="mb-5 last:mb-0">
            {!sidebarCollapsed && (
              <h3
                className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2.5 px-3"
                style={{ color: "rgba(255, 247, 236, 0.38)" }}
              >
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "group/navitem relative flex items-center gap-3 rounded-xl transition-all duration-200",
                      sidebarCollapsed ? "justify-center px-3 py-3" : "px-3 py-2.5"
                    )}
                    style={{
                      color: isActive ? "#E8C27A" : "rgba(255, 247, 236, 0.68)",
                      background: isActive ? "rgba(232, 194, 122, 0.10)" : "transparent",
                      border: isActive ? "1px solid rgba(232, 194, 122, 0.22)" : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(215, 70, 62, 0.10)";
                        e.currentTarget.style.color = "#E8C27A";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255, 247, 236, 0.68)";
                      }
                    }}
                  >
                    <Icon name={item.icon} className="h-[20px] w-[20px] flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate leading-none">{item.label}</span>
                    )}

                    {/* Collapsed tooltip */}
                    {sidebarCollapsed && (
                      <div
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/navitem:opacity-100 transition-opacity z-50"
                        style={{
                          background: "#2A1C15",
                          color: "#E8C27A",
                          border: "1px solid rgba(232, 194, 122, 0.22)",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.35)",
                        }}
                      >
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Area - User info could be added here */}
    </aside>
  );
}