"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Bell, Image, Coins, Sparkles, Crown } from "lucide-react";
type NotificationType = "generation_complete" | "generation_failed" | "credits_added" | "template_new" | "vip_template";

interface Notification {
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
    description: "您的「唐风雅韵」主题写真已生成完成，点击查看结果",
    time: "2分钟前",
    isRead: false,
  },
  {
    id: "2",
    type: "generation_failed",
    title: "生成失败，积分已退回",
    description: "由于网络问题生成失败，2积分已退回您的账户",
    time: "15分钟前",
    isRead: false,
  },
  {
    id: "3",
    type: "credits_added",
    title: "积分充值成功",
    description: "50积分已到账，现在可以开始创作更多汉服写真了",
    time: "1小时前",
    isRead: true,
  },
  {
    id: "4",
    type: "template_new",
    title: "新模板上架",
    description: "「清明上河」系列汉服模板已上架，包含3款全新造型",
    time: "3小时前",
    isRead: true,
  },
  {
    id: "5",
    type: "vip_template",
    title: "VIP模板开放",
    description: "「敦煌飞天」会员专属模板现在可以使用了，快去体验吧",
    time: "昨天",
    isRead: true,
  },
  {
    id: "6",
    type: "generation_complete",
    title: "汉服写真生成完成",
    description: "您的「仙侠情缘」主题写真已生成完成",
    time: "昨天",
    isRead: true,
  },
  {
    id: "7",
    type: "credits_added",
    title: "每日签到积分到账",
    description: "连续签到第7天，额外获得5积分奖励",
    time: "2天前",
    isRead: true,
  },
];

const getNotificationIcon = (type: NotificationType) => {
  const iconProps = { className: "w-5 h-5", strokeWidth: 1.5 };
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

type TabType = "all" | "generation" | "credits" | "system" | "unread";

export default function NotificationsPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const tabs: { key: TabType; label: string; labelEn: string }[] = [
    { key: "all", label: "全部", labelEn: "All" },
    { key: "generation", label: "生成", labelEn: "Generation" },
    { key: "credits", label: "积分", labelEn: "Credits" },
    { key: "system", label: "系统", labelEn: "System" },
    { key: "unread", label: "未读", labelEn: "Unread" },
  ];

  const filterNotifications = (notifications: Notification[]): Notification[] => {
    switch (activeTab) {
      case "generation":
        return notifications.filter((n) => n.type === "generation_complete" || n.type === "generation_failed");
      case "credits":
        return notifications.filter((n) => n.type === "credits_added");
      case "system":
        return notifications.filter((n) => n.type === "template_new" || n.type === "vip_template");
      case "unread":
        return notifications.filter((n) => !n.isRead);
      default:
        return notifications;
    }
  };

  const filteredNotifications = filterNotifications(MOCK_NOTIFICATIONS);

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0D" }}>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5 }}
        >
          <h1
            className="text-3xl font-bold md:text-4xl"
            style={{ color: "rgba(255, 247, 236, 0.92)" }}
          >
            {locale === "zh" ? "通知中心" : "Notification Center"}
          </h1>
          <p className="mt-2 text-base" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
            {locale === "zh"
              ? "查看你的生成结果、积分变动和系统消息"
              : "View your generation results, credit changes, and system messages"}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <div
            className="flex flex-wrap gap-1 rounded-2xl p-1"
            style={{ background: "rgba(255, 247, 236, 0.03)" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  color:
                    activeTab === tab.key
                      ? "#E8C27A"
                      : "rgba(255, 247, 236, 0.55)",
                  background: activeTab === tab.key ? "rgba(232, 194, 122, 0.10)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = "rgba(255, 247, 236, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {locale === "zh" ? tab.label : tab.labelEn}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}
          className="mt-6 space-y-3"
        >
          {filteredNotifications.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-2xl py-16"
              style={{ background: "rgba(255, 247, 236, 0.02)" }}
            >
              <Bell
                className="mb-4 w-12 h-12"
                style={{ color: "rgba(255, 247, 236, 0.25)" }}
                strokeWidth={1.5}
              />
              <p className="text-base" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
                {locale === "zh" ? "暂无通知" : "No notifications yet"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ease: "easeOut", duration: 0.5, delay: 0.25 + index * 0.05 }}
                className="group flex gap-4 rounded-2xl p-4 transition-colors cursor-pointer"
                style={{
                  background: "rgba(255, 247, 236, 0.02)",
                  border: "1px solid rgba(255, 247, 236, 0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 247, 236, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 247, 236, 0.02)";
                }}
              >
                <div className="flex flex-col items-center pt-1">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: "rgba(255, 247, 236, 0.04)" }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-base font-medium"
                      style={{ color: "rgba(255, 247, 236, 0.92)" }}
                    >
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full mt-2"
                        style={{ background: "#E8C27A" }}
                      />
                    )}
                  </div>
                  <p
                    className="mt-1.5 text-sm leading-relaxed"
                    style={{ color: "rgba(255, 247, 236, 0.45)" }}
                  >
                    {notification.description}
                  </p>
                  <p
                    className="mt-2 text-xs"
                    style={{ color: "rgba(255, 247, 236, 0.25)" }}
                  >
                    {notification.time}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
