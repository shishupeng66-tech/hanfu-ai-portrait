"use client";

import { cn } from "@/lib/utils";
import { LocaleLink } from "@/components/locale-link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  children: ReactNode;
  active?: boolean;
  className?: string;
  target?: "_blank";
};

export function NavBarItem({
  children,
  href,
  active,
  target,
  className,
}: Props) {
  const pathname = usePathname();
  const isActive = active || (href !== "/" && pathname?.includes(href));

  return (
    <LocaleLink
      href={href}
      className={cn(
        "flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium leading-[110%] text-[#F7F2EA]/85 transition-colors hover:bg-white/10 hover:text-white",
        isActive && "bg-white/10 text-white",
        className
      )}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
    >
      {children}
    </LocaleLink>
  );
}
