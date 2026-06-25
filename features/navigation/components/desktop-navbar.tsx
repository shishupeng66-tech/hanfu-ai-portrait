"use client";

import { LocaleLink } from "@/components/locale-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "next-intl";
import Link from "next/link";

export const DesktopNavbar = () => {
  const locale = useLocale();
  const isZh = locale === "zh";

  const brandName = isZh ? "汉韵写真" : "Han Portrait";

  const navItems = [
    {
      label: isZh ? "模板" : "Templates",
      href: "/#hanfu-styles",
    },
    {
      label: isZh ? "指南" : "Guide",
      href: "/#how-it-works",
    },
    {
      label: isZh ? "价格" : "Pricing",
      href: "/#pricing",
    },
  ];

  return (
    <header className="fixed inset-x-0 top-[18px] z-50 pointer-events-none">
      <div className="mx-auto flex h-[54px] w-[min(1180px,calc(100vw-64px))] items-center rounded-full border border-[rgba(255,247,236,0.08)] bg-[#0B0B0D]/75 px-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl pointer-events-auto">
        <LocaleLink
          href="/"
          className="flex shrink-0 items-center gap-3 whitespace-nowrap text-[18px] font-semibold tracking-[-0.02em] text-[rgba(255,247,236,0.92)] transition-colors duration-200 hover:text-[#E8C27A]"
          aria-label={`${brandName} home`}
        >
          <img
            src="/brand/logo-mark.png"
            alt={brandName}
            className="h-8 w-8 object-contain"
          />
          {isZh ? (
              <span className="text-[#E8C27A]">{brandName}</span>
            ) : (
              <span>
                <span className="text-[rgba(255,247,236,0.92)]">Han</span>
                <span className="text-[#E8C27A]"> Portrait</span>
              </span>
            )}
        </LocaleLink>

        <nav className="ml-10 flex items-center gap-3" aria-label="Primary navigation">
          {navItems.map((item) => (
            <LocaleLink
              key={item.label}
              href={item.href}
              className="group inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[15px] font-medium text-[#FFF7EC]/70 transition-colors duration-200 hover:bg-[#FFF7EC]/[0.06] hover:text-[#FFF7EC]"
            >
              <span>{item.label}</span>
              <span className="text-xs text-[rgba(255,247,236,0.25)] transition-colors duration-200 group-hover:text-[#E8C27A]">
                ˅
              </span>
            </LocaleLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="inline-flex h-10 items-center rounded-full border border-[rgba(232,194,122,0.16)] bg-[rgba(232,194,122,0.07)] px-4 text-sm font-medium text-[rgba(255,247,236,0.92)]">
            {isZh ? "积分:" : "Credits:"}
            <span className="ml-1 text-[#E8C27A]">12</span>
          </div>

          <LanguageSwitcher variant="navbarIcon" />

          <Link
            href={`/${locale}/login`}
            className="inline-flex h-10 items-center rounded-full border border-[rgba(232,194,122,0.16)] bg-[rgba(255,247,236,0.05)] px-5 text-sm font-semibold text-[rgba(255,247,236,0.92)] transition-colors duration-200 hover:border-[rgba(232,194,122,0.25)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#E8C27A]"
          >
            {isZh ? "登录" : "Login"}
          </Link>
        </div>
      </div>
    </header>
  );
};
