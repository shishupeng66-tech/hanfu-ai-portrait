"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import {
  CreditCard,
  Database,
  Home,
  ImageIcon,
  ShoppingCart,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    title: "工作台",
    href: "/admin",
    icon: Home,
  },
  {
    title: "用户中心",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "订单与支付",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "AI生成任务",
    href: "/admin/generations",
    icon: ImageIcon,
  },
  {
    title: "订阅管理",
    href: "/admin/subscriptions",
    icon: ShoppingCart,
  },
  {
    title: "积分流水",
    href: "/admin/credits",
    icon: Database,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <aside className="sticky top-0 h-screen min-h-screen w-64 shrink-0 self-start border-r border-border bg-[#0b0b0c]">
      <div className="flex min-h-screen flex-col bg-[#0b0b0c]">
        <div className="px-6 pt-16 pb-8 border-b border-border">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 justify-center w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-hover hover:text-hover-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            返回用户仪表盘
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const href = `/${locale}${item.href}`;
            const isActive =
              item.href === "/admin"
                ? pathname === href
                : pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-hover hover:text-hover-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
