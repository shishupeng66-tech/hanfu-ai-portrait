"use client";

import { useState, useEffect } from "react";
import { LocaleLink } from "@/components/locale-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const MiniNavbar = () => {
  const locale = useLocale();
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 80);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          isAtTop
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-24 opacity-0 pointer-events-none"
        )}
      >
        <nav
          className="flex items-center gap-8"
          style={{
            height: "64px",
            minWidth: "760px",
            width: "auto",
            maxWidth: "900px",
            borderRadius: "999px",
            padding: "0 18px 0 26px",
            background: "rgba(28, 16, 16, 0.72)",
            border: "1px solid rgba(232, 194, 122, 0.24)",
            backdropFilter: "blur(18px)",
            boxShadow:
              "0 18px 60px rgba(0, 0, 0, 0.28), 0 0 40px rgba(120, 35, 30, 0.16)",
          }}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <LocaleLink
            href="/"
            className="flex items-center gap-3 whitespace-nowrap transition-colors duration-200 hover:text-[#FFF7EC]"
            aria-label="HanPortrait home"
            style={{
              color: "#FFF7EC",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            <div className="relative">
              <img
                src="/brand/logo-mark.png"
                alt="HanPortrait Logo"
                className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(232,194,122,0.3)]"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#E8C27A]/10 to-[#B7352D]/10 blur-[2px]"></div>
            </div>
            <span>HanPortrait</span>
          </LocaleLink>

          {/* Navigation Links */}
          <nav className="flex items-center gap-9 ml-8" aria-label="Primary navigation">
            <LocaleLink
              href="/#hanfu-styles"
              className="transition-colors duration-200"
              style={{
                color: "rgba(255, 247, 236, 0.78)",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8C27A")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255, 247, 236, 0.78)")
              }
            >
              Hanfu Styles
            </LocaleLink>
            <LocaleLink
              href="/#how-it-works"
              className="transition-colors duration-200"
              style={{
                color: "rgba(255, 247, 236, 0.78)",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8C27A")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255, 247, 236, 0.78)")
              }
            >
              How It Works
            </LocaleLink>
            <LocaleLink
              href="/pricing"
              className="transition-colors duration-200"
              style={{
                color: "rgba(255, 247, 236, 0.78)",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8C27A")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255, 247, 236, 0.78)")
              }
            >
              Pricing
            </LocaleLink>
          </nav>

          {/* Right side: Language switcher and Login */}
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher variant="navbarIcon" />
            <Link
              href={`/${locale}/login`}
              className="flex items-center justify-center transition-all duration-200"
              style={{
                height: "38px",
                padding: "0 18px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FFF7EC",
                background: "rgba(255, 247, 236, 0.06)",
                border: "1px solid rgba(232, 194, 122, 0.26)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232, 194, 122, 0.10)";
                e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.42)";
                e.currentTarget.style.color = "#E8C27A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
                e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.26)";
                e.currentTarget.style.color = "#FFF7EC";
              }}
            >
              Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};