"use client";

import { useTranslations } from "next-intl";

import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { marketingNavigationKeys } from "@/features/navigation/config";

import { NavBarItem } from "./navbar-item";
import { NavBarItemWithDropdown } from "./navbar-item-with-dropdown";
import { UserMenu } from "./user-menu";

export const DesktopNavbar = () => {
  const t = useTranslations("navigation.main");

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-row items-center gap-2">
        <Logo />
        <div className="flex items-center gap-2">
          {marketingNavigationKeys.map((item) =>
            item.subItems ? (
              <NavBarItemWithDropdown
                key={item.key}
                href={item.href}
                target={item.target}
                subItems={item.subItems}
              >
                {t(item.key)}
              </NavBarItemWithDropdown>
            ) : (
              <NavBarItem href={item.href} key={item.key} target={item.target}>
                {t(item.key)}
              </NavBarItem>
            )
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </div>
  );
};