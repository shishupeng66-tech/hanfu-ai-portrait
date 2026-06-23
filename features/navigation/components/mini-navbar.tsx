"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LocaleLink } from "@/components/locale-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { CreditsBadge } from "@/components/ui/credits-badge";
import { getSubscriptionPlanDisplayInfo } from "@/lib/account-settings";
import type { ClientUserProfile, UserProfileResponse } from "@/lib/client-api";
import { Images, LogOut, ReceiptText, Settings } from "lucide-react";

export const MiniNavbar = () => {
  const locale = useLocale();
  const isZh = locale === "zh";
  const router = useRouter();
  const [isAtTop, setIsAtTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [userProfile, setUserProfile] = useState<ClientUserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const session = useSession();
  const isLoggedIn = !!session.data?.user;
  const menuRef = useRef<HTMLDivElement>(null);
  const isMenuOpenRef = useRef(false);

  // Fetch user profile with subscription info
  useEffect(() => {
    if (!isLoggedIn || userProfile || loadingProfile) return;
    
    const fetchUserProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = (await response.json()) as UserProfileResponse;
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile in navbar:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [isLoggedIn, userProfile, loadingProfile]);

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

  const handleAnchorClick = (
    e: MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const section = document.getElementById(id);
    if (!section) return;

    e.preventDefault();
    window.history.pushState(null, "", `/${locale}#${id}`);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const user = session.data?.user;
  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "");
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();
  const planDisplayInfo = getSubscriptionPlanDisplayInfo(
    userProfile?.subscription?.planKey,
    locale
  );

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
              onClick={(e) => handleAnchorClick(e, "hanfu-styles")}
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
              onClick={(e) => handleAnchorClick(e, "how-it-works")}
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
              onClick={(e) => handleAnchorClick(e, "pricing")}
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

                {/* Plan badge */}
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={planDisplayInfo.badgeStyle}
                >
                  {planDisplayInfo.displayNameShort}
                </span>

                {/* Credits pill */}
                <CreditsBadge credits={userProfile?.credits ?? 0} locale={locale} />

                {/* Avatar + dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen((v) => !v);
                    }}
                    onMouseEnter={() => setIsAvatarHovered(true)}
                    onMouseLeave={() => setIsAvatarHovered(false)}
                    className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors duration-200"
                    title={displayName || ""}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#E8C27A] shadow-[0_0_0_1px_rgba(24,14,12,0.72)] transition-colors duration-200 group-hover:bg-[#F2D38A]"
                    >
                      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,210,160,0.92),rgba(190,80,40,0.88)_45%,rgba(80,25,18,0.95)_100%)] text-sm font-semibold text-[#FFF7EC] transition-[filter] duration-200 group-hover:brightness-[1.02]">
                        {user?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={displayName || "User avatar"}
                            className="block h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                    </motion.div>
                    <AnimatePresence>
                      {isAvatarHovered && displayName && (
                        <motion.div
                          initial={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                          animate={{ y: 8, opacity: 1, filter: "blur(0px)" }}
                          exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            opacity: { duration: 0.2 },
                            filter: { duration: 0.2 },
                          }}
                          className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[rgba(232,194,122,0.16)] bg-[rgba(28,16,14,0.96)] px-2 py-1 text-xs font-medium text-[#FFF7EC] shadow-lg"
                        >
                          {displayName}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                          "linear-gradient(145deg, rgba(31, 16, 13, 0.74), rgba(18, 10, 10, 0.68) 54%, rgba(44, 15, 15, 0.66))",
                        border: "1px solid rgba(232, 194, 122, 0.12)",
                        borderRadius: 20,
                        boxShadow:
                          "0 28px 80px rgba(0, 0, 0, 0.42), 0 12px 30px rgba(35, 8, 8, 0.20), inset 0 1px 0 rgba(255, 247, 236, 0.05)",
                        backdropFilter: "blur(28px) saturate(1.15)",
                        padding: 9,
                      }}
                    >
                      {/* User info header (display only) */}
                      <div
                        className="px-3 py-3 mb-2"
                        style={{
                          borderRadius: 15,
                        }}
                      >
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: "rgba(255, 247, 236, 0.96)" }}
                        >
                          {displayName || (isZh ? "用户" : "User")}
                        </div>
                        {user?.email && (
                          <div
                            className="text-xs truncate mt-1"
                            style={{ color: "rgba(255, 247, 236, 0.52)" }}
                          >
                            {user.email}
                          </div>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="flex flex-col" style={{ gap: 3 }}>
                        <Link
                          href={`/${locale}/settings`}
                          onClick={() => setIsMenuOpen(false)}
                          className="group relative flex items-center gap-3 overflow-hidden px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{
                            color: "rgba(255, 247, 236, 0.74)",
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(232, 194, 122, 0.16), rgba(232, 194, 122, 0.055))";
                            e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.08)";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.96)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.74)";
                          }}
                        >
                          <span className="pointer-events-none absolute left-1.5 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[#E8C27A] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                          <Settings size={16} strokeWidth={1.8} style={{ width: 18, flexShrink: 0 }} />
                          {isZh ? "设置" : "Settings"}
                        </Link>

                        <Link
                          href={`/${locale}/credits`}
                          onClick={() => setIsMenuOpen(false)}
                          className="group relative flex items-center gap-3 overflow-hidden px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{
                            color: "rgba(255, 247, 236, 0.74)",
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(232, 194, 122, 0.16), rgba(232, 194, 122, 0.055))";
                            e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.08)";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.96)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.74)";
                          }}
                        >
                          <span className="pointer-events-none absolute left-1.5 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[#E8C27A] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                          <ReceiptText size={16} strokeWidth={1.8} style={{ width: 18, flexShrink: 0 }} />
                          {isZh ? "积分明细" : "Credit History"}
                        </Link>

                        <Link
                          href={`/${locale}/generate`}
                          onClick={() => setIsMenuOpen(false)}
                          className="group relative flex items-center gap-3 overflow-hidden px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{
                            color: "rgba(255, 247, 236, 0.74)",
                            border: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(232, 194, 122, 0.16), rgba(232, 194, 122, 0.055))";
                            e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.08)";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.96)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                            e.currentTarget.style.color = "rgba(255, 247, 236, 0.74)";
                          }}
                        >
                          <span className="pointer-events-none absolute left-1.5 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[#E8C27A] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
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
                          className="group relative flex items-center gap-3 overflow-hidden px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full"
                          style={{
                            color: "rgba(255, 139, 128, 0.90)",
                            background: "rgba(180, 39, 32, 0.055)",
                            border: "1px solid rgba(255, 105, 94, 0.10)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(232, 194, 122, 0.12), rgba(190, 45, 38, 0.12))";
                            e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.10)";
                            e.currentTarget.style.color = "rgba(255, 166, 156, 0.98)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(180, 39, 32, 0.055)";
                            e.currentTarget.style.borderColor = "rgba(255, 105, 94, 0.10)";
                            e.currentTarget.style.color = "rgba(255, 139, 128, 0.90)";
                          }}
                        >
                          <span className="pointer-events-none absolute left-1.5 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-[#E8C27A] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
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
