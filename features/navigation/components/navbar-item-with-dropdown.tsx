"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageSquare, Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SubItem {
  key: string;
  href: string;
  icon?: string;
}

interface NavBarItemWithDropdownProps {
  href: string;
  target?: "_blank";
  subItems?: SubItem[];
  children: React.ReactNode;
}

const iconMap = {
  MessageSquare,
  Image,
  Video,
};

export function NavBarItemWithDropdown({
  href,
  target,
  subItems,
  children,
}: NavBarItemWithDropdownProps) {
  const t = useTranslations("navigation.main");
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  if (!subItems?.length) {
    return (
      <Link
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className="rounded-lg px-4 py-2 text-sm font-medium text-[#F7F2EA]/85 transition-colors hover:bg-white/10 hover:text-white"
      >
        {children}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={cn(
          "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          isOpen ? "bg-white/15 text-white" : "text-[#F7F2EA]/85 hover:bg-white/10 hover:text-white"
        )}
      >
        {children}
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 z-50 mt-1 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#0E0E0E] shadow-lg"
          >
            <div className="py-2">
              {subItems.map((subItem) => {
                const IconComponent = subItem.icon ? iconMap[subItem.icon as keyof typeof iconMap] : null;

                return (
                  <Link
                    key={subItem.key}
                    href={subItem.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    {IconComponent ? <IconComponent className="h-4 w-4 text-white/45" /> : null}
                    <span>{t(subItem.key)}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
