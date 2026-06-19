"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames } from '@/i18n.config';
import type { Locale } from '@/i18n.config';
import { useState, useRef, useEffect } from 'react';
import { Globe2, Check, Sparkles } from 'lucide-react';
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
            ? "group flex h-[42px] w-[42px] items-center justify-center bg-transparent transition-colors duration-200 focus:outline-none"
            : "flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all duration-200 border border-white/12 bg-white/8 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#B7352D] focus:ring-opacity-50"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select language"
      >
        {variant === "navbarIcon" ? (
          <Sparkles className="h-[18px] w-[18px] text-[rgba(232,194,122,0.58)] transition-colors duration-200 group-hover:text-[rgba(255,247,236,0.86)]" />
        ) : (
          <>
            <Globe2 className="w-4 h-4" />
            <span className="font-medium">{localeNames[locale as Locale]}</span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 p-2 w-[170px] z-[60]",
            "rounded-[16px] border border-[rgba(232,194,122,0.16)] bg-[rgba(28,16,14,0.96)] text-[#FFF7EC] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-[18px]",
            "animate-in fade-in-0 zoom-in-95"
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
                  "flex items-center justify-between w-full px-3 py-2.5 h-[40px] rounded-[10px] text-sm font-medium",
                  isActive ? "text-[#E8C27A]" : "text-[rgba(255,247,236,0.72)] hover:bg-[rgba(232,194,122,0.10)] hover:text-[#FFF7EC]",
                  "transition-colors duration-150"
                )}
                role="menuitem"
              >
                <span>
                  {loc === 'zh' ? '简体中文' : 'English'}
                </span>
                {isActive && (
                  <Check className="w-4 h-4 text-[#E8C27A]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
