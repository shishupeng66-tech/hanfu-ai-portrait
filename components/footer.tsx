"use client";
import React from "react";
import { Logo } from "./Logo";
import { useTranslations } from 'next-intl';
import { LocaleLink } from './locale-link';

export const Footer = () => {
  const t = useTranslations();
  
  const links = [
    {
      name: t('navigation.main.pricing'),
      href: "/pricing",
    },
    {
      name: t('navigation.main.contact'),
      href: "/contact",
    },
  ];
  const legal = [
    {
      name: t('navigation.footer.legal.terms'),
      href: "/terms",
    },
    {
      name: t('navigation.footer.legal.privacy'),
      href: "/privacy",
    },
    {
      name: t('navigation.footer.legal.cookies'),
      href: "/cookies",
    },
    {
      name: t('navigation.footer.legal.refund'),
      href: "/refund",
    },
  ];
  return (
    <div className="relative">
      <div className="border-t border-border px-8 py-20 relative bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Footer Links Section */}
          <div className="text-sm text-muted-foreground flex sm:flex-row flex-col justify-between items-start">
            <div>
              <div className="mr-4 md:flex mb-4">
                <Logo />
              </div>
              <div>{t('common.brand.copyright')}</div>
              <div className="mt-2">{t('common.brand.allRightsReserved')}</div>
            </div>
            <div className="grid grid-cols-2 gap-10 items-start mt-10 md:mt-0">
              <div className="flex justify-center space-y-4 flex-col mt-4">
                {links.map((link) => (
                  <LocaleLink
                    key={link.name}
                    className="transition-colors hover:text-foreground text-muted-foreground text-xs sm:text-sm"
                    href={link.href}
                  >
                    {link.name}
                  </LocaleLink>
                ))}
              </div>
              <div className="flex justify-center space-y-4 flex-col mt-4">
                {legal.map((link) => (
                  <LocaleLink
                    key={link.name}
                    className="transition-colors hover:text-foreground text-muted-foreground text-xs sm:text-sm"
                    href={link.href}
                  >
                    {link.name}
                  </LocaleLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
