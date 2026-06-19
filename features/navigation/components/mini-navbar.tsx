"use client";

import { useState, useEffect, useRef } from "react";
import { LocaleLink } from "@/components/locale-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";

export const MiniNavbar = () => {
  const locale = useLocale();
  const isZh = locale === "zh";
  const router = useRouter();
  const [isAtTop, setIsAtTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const session = useSession();
  const isLoggedIn = !!session.data?.user;
  const menuRef = useRef<HTMLDivElement>(null);
  const isMenuOpenRef = useRef(false);

  // Keep ref in sync with isMenuOpen for scroll handler
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Close menu on scroll — only register once, use ref to read state
  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 80);
      if (isMenuOpenRef.current) {
        setIsMenuOpen(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
    router.refresh();
    router.push(`/${locale}`);
  };

  const user = session.data?.user;
  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "");
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="fixed left-1/2 z-50 -translate-x-1/2" style={{ top: 13 }}>
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          isAtTop
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-24 opacity-0 pointer-events-none"
        )}
      >
        <nav
          className="flex items-center"
          style={{
            height: "52px",
            minWidth: "1180px",
            width: "auto",
            maxWidth: "1180px",
            borderRadius: "999px",
            padding: "0 20px",
            background: "rgba(24, 14, 12, 0.72)",
            border: "1px solid rgba(232, 194, 122, 0.16)",
            backdropFilter: "blur(18px)",
            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.22), 0 0 30px rgba(120, 35, 30, 0.10)",
          }}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <LocaleLink
            href="/"
            className="flex items-center whitespace-nowrap transition-colors duration-200"
            aria-label="Han Portrait home"
            style={{ gap: 10 }}
          >
            <img
              src="/brand/logo-mark.png"
              alt="Han Portrait Logo"
              className="object-contain"
              style={{ height: 35, width: 35 }}
            />
            <span
              style={{
                fontSize: "17.5px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {isZh ? (
                <span style={{ color: "#E8C27A" }}>汉韵写真</span>
              ) : (
                <>
                  <span style={{ color: "#FFF7EC" }}>Han</span>
                  <span style={{ color: "#E8C27A" }}> Portrait</span>
                </>
              )}
            </span>
          </LocaleLink>

          {/* Navigation Links */}
          <nav className="flex items-center" aria-label="Primary navigation" style={{ marginLeft: 42, gap: 12 }}>
            <LocaleLink
              href="/#hanfu-styles"
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                height: 36,
                padding: "0 14px",
                color: "rgba(255, 247, 236, 0.72)",
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: "0.005em",
                background: "transparent",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
                e.currentTarget.style.color = "#FFF7EC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255, 247, 236, 0.72)";
              }}
            >
              {isZh ? "模板" : "Templates"}
              <span style={{ marginLeft: 6, opacity: 0.55 }}>⌄</span>
            </LocaleLink>
            <LocaleLink
              href="/#how-it-works"
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                height: 36,
                padding: "0 14px",
                color: "rgba(255, 247, 236, 0.72)",
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: "0.005em",
                background: "transparent",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
                e.currentTarget.style.color = "#FFF7EC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255, 247, 236, 0.72)";
              }}
            >
              {isZh ? "指南" : "Guide"}
              <span style={{ marginLeft: 6, opacity: 0.55 }}>⌄</span>
            </LocaleLink>
            <LocaleLink
              href="/#pricing"
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                height: 36,
                padding: "0 14px",
                color: "rgba(255, 247, 236, 0.72)",
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: "0.005em",
                background: "transparent",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
                e.currentTarget.style.color = "#FFF7EC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255, 247, 236, 0.72)";
              }}
            >
              {isZh ? "价格" : "Pricing"}
              <span style={{ marginLeft: 6, opacity: 0.55 }}>⌄</span>
            </LocaleLink>
          </nav>

          {/* Right side: language → credits → avatar (logged in) / language → login (logged out) */}
          <div className="ml-auto flex items-center" style={{ gap: 12 }}>
            {isLoggedIn ? (
              <>
                {/* Language switcher */}
                <LanguageSwitcher variant="navbarIcon" />

                {/* Credits pill */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    height: 38,
                    padding: "0 16px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#FFF7EC",
                    background: "rgba(232, 194, 122, 0.08)",
                    border: "1px solid rgba(232, 194, 122, 0.20)",
                  }}
                >
                  {isZh ? "积分: " : "Credits: "}
                  <span style={{ color: "#E8C27A", marginLeft: 2 }}>12</span>
                </div>

                {/* Avatar + dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((v) => !v)}
                    className="flex items-center justify-center transition-all duration-200"
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#FFF7EC",
                      background: "linear-gradient(135deg, rgba(200,58,50,0.95), rgba(145,86,36,0.95))",
                      border: "1px solid rgba(232, 194, 122, 0.28)",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.48)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.28)";
                    }}
                    title={displayName || ""}
                  >
                    {initial}
                  </button>

                  {/* Dropdown menu */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 z-50"
                      style={{
                        top: "calc(100% + 10px)",
                        width: 280,
                        background: "rgba(24, 16, 13, 0.96)",
                        border: "1px solid rgba(232, 194, 122, 0.18)",
                        borderRadius: 18,
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.38)",
                        backdropFilter: "blur(18px)",
                        padding: 10,
                      }}
                    >
                      {/* User info header */}
                      <div
                        className="flex items-center gap-3 px-3 py-3 mb-1"
                        style={{
                          borderRadius: 12,
                          background: "rgba(232, 194, 122, 0.04)",
                          border: "1px solid rgba(232, 194, 122, 0.08)",
                        }}
                      >
                        <div
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{
                            height: 40,
                            width: 40,
                            borderRadius: "999px",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#FFF7EC",
                            background: "linear-gradient(135deg, rgba(200,58,50,0.95), rgba(145,86,36,0.95))",
                            border: "1px solid rgba(232, 194, 122, 0.28)",
                          }}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="text-sm font-medium truncate"
                            style={{ color: "#FFF7EC" }}
                          >
                            {displayName || (isZh ? "用户" : "User")}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: "rgba(255, 247, 236, 0.5)" }}
                          >
                            {user?.email || ""}
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="flex flex-col">
                        <Link
                          href={`/${locale}/settings`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                          style={{ color: "rgba(255, 247, 236, 0.78)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
                            e.currentTarget.style.color = "#FFF7EC";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.78)";
                          }}
                        >
                          <span style={{ width: 18, textAlign: "center" }}>⚙</span>
                          {isZh ? "设置" : "Settings"}
                        </Link>

                        <Link
                          href={`/${locale}/credits`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                          style={{ color: "rgba(255, 247, 236, 0.78)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
                            e.currentTarget.style.color = "#FFF7EC";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.78)";
                          }}
                        >
                          <span style={{ width: 18, textAlign: "center" }}>◉</span>
                          {isZh ? "积分明细" : "Credit History"}
                        </Link>

                        <Link
                          href={`/${locale}/generate`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                          style={{ color: "rgba(255, 247, 236, 0.78)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
                            e.currentTarget.style.color = "#FFF7EC";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.78)";
                          }}
                        >
                          <span style={{ width: 18, textAlign: "center" }}>🖼</span>
                          {isZh ? "我的作品" : "My Gallery"}
                        </Link>

                        {/* Divider */}
                        <div
                          className="my-1.5"
                          style={{
                            height: 1,
                            background: "rgba(232, 194, 122, 0.10)",
                          }}
                        />

                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full"
                          style={{ color: "rgba(255, 247, 236, 0.62)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 247, 236, 0.06)";
                            e.currentTarget.style.color = "#FFF7EC";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.62)";
                          }}
                        >
                          <span style={{ width: 18, textAlign: "center" }}>↩</span>
                          {isZh ? "退出登录" : "Log out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Language switcher */}
                <LanguageSwitcher variant="navbarIcon" />

                {/* Login button */}
                <Link
                  href={`/${locale}/login?callbackUrl=/${locale}`}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    height: 38,
                    padding: "0 18px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 500,
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
                  {isZh ? "登录" : "Login"}
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};