"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Image, Coins, Sparkles, Crown, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export type NotificationType = "generation_complete" | "generation_failed" | "credits_added" | "template_new" | "vip_template";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "generation_complete",
    title: "汉服写真生成完成",
    description: "您的「唐风雅韵」主题写真已生成完成",
    time: "2分钟前",
    isRead: false,
  },
  {
    id: "2",
    type: "generation_failed",
    title: "生成失败，积分已退回",
    description: "由于网络问题生成失败，2积分已退回账户",
    time: "15分钟前",
    isRead: false,
  },
  {
    id: "3",
    type: "credits_added",
    title: "积分充值成功",
    description: "50积分已到账，现在可以开始创作了",
    time: "1小时前",
    isRead: true,
  },
  {
    id: "4",
    type: "template_new",
    title: "新模板上架",
    description: "「清明上河」系列汉服模板已上架",
    time: "3小时前",
    isRead: true,
  },
  {
    id: "5",
    type: "vip_template",
    title: "VIP模板开放",
    description: "「敦煌飞天」会员专属模板现在可以使用了",
    time: "昨天",
    isRead: true,
  },
];

const getNotificationIcon = (type: NotificationType) => {
  const iconProps = { className: "w-4 h-4", strokeWidth: 1.5 };
  switch (type) {
    case "generation_complete":
      return <Image {...iconProps} style={{ color: "#E8C27A" }} />;
    case "generation_failed":
      return <Sparkles {...iconProps} style={{ color: "rgba(255, 247, 236, 0.55)" }} />;
    case "credits_added":
      return <Coins {...iconProps} style={{ color: "#E8C27A" }} />;
    case "template_new":
      return <Image {...iconProps} style={{ color: "rgba(255, 247, 236, 0.55)" }} />;
    case "vip_template":
      return <Crown {...iconProps} style={{ color: "#E8C27A" }} />;
    default:
      return <Bell {...iconProps} style={{ color: "rgba(255, 247, 236, 0.55)" }} />;
  }
};

export function NotificationDropdown() {
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const hasUnread = notifications.some((n) => !n.isRead);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push(`/${locale}/notifications`);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="group flex h-[42px] w-[42px] items-center justify-center transition-all duration-200 focus:outline-none rounded-full"
        style={{
          background: "transparent",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(232,194,122,0.10)";
          e.currentTarget.style.borderColor = "rgba(232,194,122,0.20)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
        }}
      >
        <Bell
          className="h-[18px] w-[18px] transition-colors duration-200"
          style={{ color: "rgba(232,194,122,0.58)" }}
          strokeWidth={1.5}
        />
        {hasUnread && (
          <span
            className="absolute top-2.5 right-2.5 w-[7px] h-[7px] rounded-full"
            style={{ background: "#E8C27A" }}
          />
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-[360px] overflow-hidden z-50"
          style={{
            background: "rgba(17, 17, 20, 0.96)",
            border: "1px solid rgba(255, 247, 236, 0.08)",
            borderRadius: "18px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255, 247, 236, 0.06)" }}>
            <span className="text-base font-semibold" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
              {locale === "zh" ? "通知" : "Notifications"}
            </span>
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium transition-colors"
                style={{ color: "rgba(255, 247, 236, 0.45)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#E8C27A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 247, 236, 0.45)";
                }}
              >
                {locale === "zh" ? "全部已读" : "Mark all read"}
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className="flex gap-3 px-5 py-3.5 cursor-pointer transition-colors"
                style={{
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 247, 236, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div className="flex flex-col items-center pt-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: "rgba(255, 247, 236, 0.04)" }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "#E8C27A" }} />
                    )}
                  </div>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
                    {notification.description}
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: "rgba(255, 247, 236, 0.25)" }}>
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t" style={{ borderColor: "rgba(255, 247, 236, 0.06)" }}>
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                color: "rgba(255, 247, 236, 0.72)",
                background: "rgba(255, 247, 236, 0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(255, 247, 236, 0.92)";
                e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 247, 236, 0.72)";
                e.currentTarget.style.background = "rgba(255, 247, 236, 0.04)";
              }}
            >
              {locale === "zh" ? "查看全部通知" : "View all notifications"}
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
