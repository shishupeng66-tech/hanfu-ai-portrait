"use client";

import { LocaleLink } from "@/components/locale-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "next-intl";
import Link from "next/link";

export const DesktopNavbar = () => {
  const locale = useLocale();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 bg-gradient-to-b from-[rgba(12,8,8,0.62)] to-[rgba(12,8,8,0)]">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-12">
        <div className="flex items-center">
          <LocaleLink
            href="/"
            className="flex items-center gap-2 whitespace-nowrap text-base font-bold text-[#FFF7EC] transition-colors duration-200 hover:text-[#FFF7EC]"
            aria-label="HanPortrait home"
          >
            <span className="text-[#E8C27A]">✦</span>
            <span>HanPortrait</span>
          </LocaleLink>
        </div>

        <nav className="flex items-center gap-10" aria-label="Primary navigation">
          <LocaleLink
            href="/#hanfu-styles"
            className="text-sm font-medium text-[#FFF7EC]/[0.58] transition-colors duration-200 hover:text-[#E8C27A]"
          >
            Hanfu Styles
          </LocaleLink>
          <LocaleLink
            href="/#how-it-works"
            className="text-sm font-medium text-[#FFF7EC]/[0.58] transition-colors duration-200 hover:text-[#E8C27A]"
          >
            How It Works
          </LocaleLink>
          <LocaleLink
            href="/pricing"
            className="text-sm font-medium text-[#FFF7EC]/[0.58] transition-colors duration-200 hover:text-[#E8C27A]"
          >
            Pricing
          </LocaleLink>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="navbarIcon" />
          <Link
            href={`/${locale}/login`}
            className="rounded-full border border-[#E8C27A]/[0.24] bg-[#FFF7EC]/[0.06] px-5 py-2.5 text-sm font-semibold leading-none text-[#FFF7EC] transition-all duration-200 hover:border-[#E8C27A]/[0.42] hover:bg-[#E8C27A]/10 hover:text-[#E8C27A]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};
