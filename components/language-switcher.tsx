"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames } from '@/i18n.config';
import type { Locale } from '@/i18n.config';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe2, Check, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
  variant?: "default" | "navbarIcon";
};

export function LanguageSwitcher({ variant = "default" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    let path = pathname;

    for (const loc of locales) {
      if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
        path = pathname.slice(loc.length + 1) || '/';
        break;
      }
    }

    const normalizedPath = path === '/' ? '' : path;
    router.push(`/${newLocale}${normalizedPath}`);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          variant === "navbarIcon"
            ? "flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#E8C27A]/[0.16] bg-[#FFF7EC]/[0.055] text-[#FFF7EC]/[0.78] transition-all duration-200 hover:border-[#E8C27A]/[0.28] hover:bg-[#E8C27A]/10 hover:text-[#E8C27A] focus:outline-none focus:ring-2 focus:ring-[#E8C27A]/30"
            : "flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all duration-200 border border-white/12 bg-white/8 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#B7352D] focus:ring-opacity-50"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select language"
      >
        {variant === "navbarIcon" ? (
          <Languages className="h-4 w-4" />
        ) : (
          <>
            <Globe2 className="w-4 h-4" />
            <span className="font-medium">{localeNames[locale as Locale]}</span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 py-1 min-w-[150px]",
            variant === "navbarIcon"
              ? "rounded-xl border border-[#E8C27A]/[0.18] bg-[rgba(20,12,12,0.92)] text-[#FFF7EC] shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-[18px]"
              : "bg-[#0E0E0E] text-white border border-white/12 rounded-lg shadow-lg",
            "animate-in fade-in-0 zoom-in-95",
            "z-50"
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {locales.map((loc) => {
            const isActive = loc === locale;
            return (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm",
                  variant === "navbarIcon" ? "hover:bg-[#E8C27A]/10" : "hover:bg-white/10",
                  "transition-colors duration-150",
                  isActive && (variant === "navbarIcon" ? "bg-[#E8C27A]/10 text-[#E8C27A]" : "bg-white/15 text-white")
                )}
                role="menuitem"
              >
                <span className={cn(
                  "font-medium",
                  isActive ? (variant === "navbarIcon" ? "text-[#E8C27A]" : "text-white") : (variant === "navbarIcon" ? "text-[#FFF7EC]/65" : "text-white/60")
                )}>
                  {localeNames[loc]}
                </span>
                {isActive && (
                  <Check className={cn("w-4 h-4", variant === "navbarIcon" ? "text-[#E8C27A]" : "text-white/80")} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
