"use client";

import { useState, useEffect, useRef } from "react";
import { LocaleLink } from "@/components/locale-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { CreditsBadge } from "@/components/ui/credits-badge";
import { Images, LogOut, ReceiptText, Settings } from "lucide-react";

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
    const handlePointerDown = (e: PointerEvent) => {
      if (
        isMenuOpenRef.current &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

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
            style={{ gap: 12 }}
          >
            <img
              src="/brand/logo-mark.png"
              alt="Han Portrait Logo"
              className="object-contain"
              style={{ height: 42, width: 42 }}
            />
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {isZh ? (
                <span
                  style={{
                    fontFamily: '"Songti SC", STSong, SimSun, serif',
                    fontWeight: 600,
                    letterSpacing: "0.045em",
                  }}
                >
                  <span style={{ color: "#E8C27A" }}>汉韵</span>
                  <span style={{ color: "#FFF7EC" }}>写真</span>
                </span>
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
                color: isZh ? "rgba(255, 247, 236, 0.80)" : "rgba(255, 247, 236, 0.72)",
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: isZh ? "0.055em" : "0.005em",
                background: "transparent",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isZh
                  ? "rgba(232, 194, 122, 0.085)"
                  : "rgba(255, 247, 236, 0.06)";
                e.currentTarget.style.color = isZh ? "#E8C27A" : "#FFF7EC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = isZh
                  ? "rgba(255, 247, 236, 0.80)"
                  : "rgba(255, 247, 236, 0.72)";
              }}
            >
              {isZh ? "模板" : "Templates"}
            </LocaleLink>
            <LocaleLink
              href="/#how-it-works"
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                height: 36,
                padding: "0 14px",
                color: isZh ? "rgba(255, 247, 236, 0.80)" : "rgba(255, 247, 236, 0.72)",
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: isZh ? "0.055em" : "0.005em",
                background: "transparent",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isZh
                  ? "rgba(232, 194, 122, 0.085)"
                  : "rgba(255, 247, 236, 0.06)";
                e.currentTarget.style.color = isZh ? "#E8C27A" : "#FFF7EC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = isZh
                  ? "rgba(255, 247, 236, 0.80)"
                  : "rgba(255, 247, 236, 0.72)";
              }}
            >
              {isZh ? "流程" : "Guide"}
            </LocaleLink>
            <LocaleLink
              href="/#pricing"
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{
                height: 36,
                padding: "0 14px",
                color: isZh ? "rgba(255, 247, 236, 0.80)" : "rgba(255, 247, 236, 0.72)",
                fontSize: "15px",
                fontWeight: 500,
                letterSpacing: isZh ? "0.055em" : "0.005em",
                background: "transparent",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isZh
                  ? "rgba(232, 194, 122, 0.085)"
                  : "rgba(255, 247, 236, 0.06)";
                e.currentTarget.style.color = isZh ? "#E8C27A" : "#FFF7EC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = isZh
                  ? "rgba(255, 247, 236, 0.80)"
                  : "rgba(255, 247, 236, 0.72)";
              }}
            >
              {isZh ? "价格" : "Pricing"}
            </LocaleLink>
          </nav>

          {/* Right side: language → credits → avatar (logged in) / language → login (logged out) */}
          <div className="ml-auto flex items-center" style={{ gap: 12 }}>
            {isLoggedIn ? (
              <>
                {/* Language switcher */}
                <LanguageSwitcher variant="navbarIcon" />

                {/* Credits pill */}
                <CreditsBadge credits={12} locale={locale} />

                {/* Avatar + dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen((v) => !v);
                    }}
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
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        top: "calc(100% + 10px)",
                        width: 268,
                        background:
                          "linear-gradient(145deg, rgba(28, 15, 12, 0.98), rgba(18, 10, 10, 0.98) 52%, rgba(43, 14, 14, 0.96))",
                        border: "1px solid rgba(232, 194, 122, 0.22)",
                        borderRadius: 20,
                        boxShadow:
                          "0 24px 70px rgba(0, 0, 0, 0.48), 0 10px 26px rgba(35, 8, 8, 0.34)",
                        backdropFilter: "blur(18px)",
                        padding: 9,
                      }}
                    >
                      {/* User info header */}
                      <div
                        className="flex items-center gap-3 px-3 py-3 mb-2"
                        style={{
                          borderRadius: 15,
                          background:
                            "linear-gradient(135deg, rgba(232, 194, 122, 0.075), rgba(128, 28, 28, 0.10))",
                          border: "1px solid rgba(232, 194, 122, 0.16)",
                          boxShadow: "inset 0 1px 0 rgba(255, 247, 236, 0.035)",
                        }}
                      >
                        <div
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{
                            height: 40,
                            width: 40,
                            borderRadius: "999px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#FFF7EC",
                            background:
                              "linear-gradient(135deg, rgba(178, 44, 38, 0.96), rgba(132, 75, 31, 0.96))",
                            border: "1px solid rgba(232, 194, 122, 0.34)",
                            boxShadow: "0 8px 18px rgba(48, 8, 8, 0.28)",
                          }}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="text-sm font-semibold truncate"
                            style={{ color: "rgba(255, 247, 236, 0.96)" }}
                          >
                            {displayName || (isZh ? "用户" : "User")}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: "rgba(255, 247, 236, 0.42)" }}
                          >
                            {user?.email || ""}
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="flex flex-col" style={{ gap: 3 }}>
                        <Link
                          href={`/${locale}/settings`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{
                            color: "rgba(255, 247, 236, 0.74)",
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(232, 194, 122, 0.075)";
                            e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.10)";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.96)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.74)";
                          }}
                        >
                          <Settings size={16} strokeWidth={1.8} style={{ width: 18, flexShrink: 0 }} />
                          {isZh ? "设置" : "Settings"}
                        </Link>

                        <Link
                          href={`/${locale}/credits`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{
                            color: "rgba(255, 247, 236, 0.74)",
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(232, 194, 122, 0.075)";
                            e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.10)";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.96)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.74)";
                          }}
                        >
                          <ReceiptText size={16} strokeWidth={1.8} style={{ width: 18, flexShrink: 0 }} />
                          {isZh ? "积分明细" : "Credit History"}
                        </Link>

                        <Link
                          href={`/${locale}/generate`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{
                            color: "rgba(255, 247, 236, 0.74)",
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(232, 194, 122, 0.075)";
                            e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.10)";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.96)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.74)";
                          }}
                        >
                          <Images size={16} strokeWidth={1.8} style={{ width: 18, flexShrink: 0 }} />
                          {isZh ? "我的作品" : "My Gallery"}
                        </Link>

                        {/* Divider */}
                        <div
                          className="my-1"
                          style={{
                            height: 1,
                            background: "rgba(232, 194, 122, 0.11)",
                          }}
                        />

                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full"
                          style={{
                            color: "rgba(255, 139, 128, 0.90)",
                            background: "rgba(180, 39, 32, 0.075)",
                            border: "1px solid rgba(255, 105, 94, 0.14)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(190, 45, 38, 0.14)";
                            e.currentTarget.style.borderColor = "rgba(255, 105, 94, 0.24)";
                            e.currentTarget.style.color = "rgba(255, 166, 156, 0.98)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(180, 39, 32, 0.075)";
                            e.currentTarget.style.borderColor = "rgba(255, 105, 94, 0.14)";
                            e.currentTarget.style.color = "rgba(255, 139, 128, 0.90)";
                          }}
                        >
                          <LogOut size={16} strokeWidth={1.8} style={{ width: 18, flexShrink: 0 }} />
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
