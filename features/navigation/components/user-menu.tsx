"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import {
  IconUser,
  IconLogout,
  IconLayoutDashboard,
  IconShield,
  IconCoins,
  IconSettings,
} from "@tabler/icons-react";

type UserMenuProps = {
  variant?: "default" | "navbar";
};

export function UserMenu({ variant = "default" }: UserMenuProps) {
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 检查用户是否是管理员
    const checkAdminStatus = async () => {
      if (session.data?.user?.id) {
        try {
          const response = await fetch('/api/user/admin-status');
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
          }
        } catch (error) {
          console.error('Failed to check admin status:', error);
        }
      }
    };
    
    checkAdminStatus();
  }, [session.data?.user?.id]);

  if (session.isPending) {
    return (
      <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!session.data?.user) {
    if (variant === "navbar") {
      return (
        <Link
          href={`/${locale}/login`}
          className="rounded-full border border-[rgba(232,194,122,0.24)] bg-[rgba(255,247,236,0.055)] px-5 py-2.5 text-sm font-semibold leading-none text-[rgba(255,247,236,0.92)] transition-all duration-200 hover:-translate-y-px hover:border-[rgba(232,194,122,0.40)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#E8C27A]"
        >
          Login
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/login`}
          className="text-sm text-[rgba(255,247,236,0.72)] hover:text-[rgba(255,247,236,0.92)] transition-colors"
        >
          {t('common.actions.signIn')}
        </Link>
        <Link
          href={`/${locale}/signup`}
          className="bg-[rgba(232,194,122,0.10)] hover:bg-[rgba(232,194,122,0.16)] border border-[rgba(232,194,122,0.16)] text-[#E8C27A] text-sm px-4 py-1.5 rounded-full transition-all"
        >
          {t('common.actions.getStarted')}
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const user = session.data.user;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-6 w-6 rounded-full bg-gradient-to-br from-[rgba(232,194,122,0.92)] via-[rgba(232,194,122,0.60)] to-[rgba(232,194,122,0.30)] flex items-center justify-center text-[rgba(255,247,236,0.92)] text-xs ring-1 ring-transparent hover:ring-[rgba(232,194,122,0.50)] transition-all"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={24}
            height={24}
            className="h-full w-full rounded-full object-cover"
            unoptimized
          />
        ) : (
          initial
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 min-w-[12rem] max-w-[18rem] bg-[#111114] rounded-lg shadow-navbar border border-[rgba(255,247,236,0.08)] py-1 z-20">
            <div className="px-4 py-2 border-b border-[rgba(255,247,236,0.08)]">
              <p className="text-sm font-medium text-[rgba(255,247,236,0.92)] break-words">
                {user.name || user.email}
              </p>
              {user.name && (
                <p className="text-xs text-[rgba(255,247,236,0.45)] mt-0.5 break-words">
                  {user.email}
                </p>
              )}
            </div>

            <Link
              href={`/${locale}/dashboard`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[rgba(255,247,236,0.72)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#E8C27A] transition-colors"
            >
              <IconLayoutDashboard className="w-4 h-4" />
              {t('navigation.main.dashboard')}
            </Link>

            <Link
              href={`/${locale}/settings`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[rgba(255,247,236,0.72)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#E8C27A] transition-colors"
            >
              <IconSettings className="w-4 h-4" />
              {t('navigation.main.settings')}
            </Link>

            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[rgba(255,247,236,0.72)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#E8C27A] transition-colors"
              >
                <IconShield className="w-4 h-4" />
                {t('Admin.sidebar.title')}
              </Link>
            )}

            <Link
              href={`/${locale}/credits`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[rgba(255,247,236,0.72)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#E8C27A] transition-colors"
            >
              <IconCoins className="w-4 h-4" />
              {t('navigation.main.credits')}
            </Link>

            <Link
              href={`/${locale}/profile`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[rgba(255,247,236,0.72)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#E8C27A] transition-colors"
            >
              <IconUser className="w-4 h-4" />
              {t('navigation.main.profile')}
            </Link>

            <div className="border-t border-[rgba(255,247,236,0.08)] mt-1 pt-1">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[rgba(255,247,236,0.72)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#E8C27A] transition-colors text-left"
              >
                <IconLogout className="w-4 h-4" />
                {t('common.actions.signOut')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
