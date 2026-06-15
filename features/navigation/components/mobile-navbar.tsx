"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import Link from "next/link";
import { ChevronRight, MessageSquare, Image as ImageIcon, Video } from "lucide-react";

import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { marketingNavigationKeys } from "@/features/navigation/config";

const iconMap = {
  MessageSquare: MessageSquare,
  Image: ImageIcon,
  Video: Video,
};

export const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('navigation.main');
  const tCommon = useTranslations('common.actions');

  return (
    <div className="flex justify-between items-center w-full px-4">
      <Logo />
      <IoIosMenu
        className="text-white h-6 w-6"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col items-start justify-start pt-4 text-xl text-white/60 transition duration-200">
          <div className="flex items-center justify-between w-full px-5 pb-4 border-b border-white/10">
            <Logo />
            <div className="flex items-center">
              <button
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <IoIosClose className="h-7 w-7 text-white" />
              </button>
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-3 px-6 py-6 w-full overflow-y-auto flex-1">
            {marketingNavigationKeys.map((navItem) => (
              <div key={navItem.key} className="w-full">
                {navItem.subItems ? (
                  <>
                    <button
                      onClick={() => {
                        setExpandedItems(prev =>
                          prev.includes(navItem.key)
                            ? prev.filter(item => item !== navItem.key)
                            : [...prev, navItem.key]
                        );
                      }}
                      className="flex items-center justify-between w-full gap-3 group py-2"
                    >
                      <span className="text-xl text-white font-semibold">
                        {t(navItem.key)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50 font-medium px-2 py-0.5 bg-white/10 rounded-full">
                          {navItem.subItems.length}
                        </span>
                        <ChevronRight
                          className={cn(
                            "w-5 h-5 text-white/50 transition-transform duration-200",
                            expandedItems.includes(navItem.key) && "rotate-90"
                          )}
                        />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedItems.includes(navItem.key) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-1 mt-2 space-y-0.5 bg-white/5 rounded-2xl p-2 border border-white/10">
                            {navItem.subItems.map((subItem, index) => {
                              const IconComponent = subItem.icon ? iconMap[subItem.icon as keyof typeof iconMap] : null;
                              return (
                                <motion.div
                                  key={subItem.key}
                                  initial={{ x: -8, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: index * 0.04, duration: 0.15 }}
                                >
                                  <Link
                                    href={`/${locale}${subItem.href}`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-white/10 transition-all duration-150 active:scale-[0.98]"
                                  >
                                    {IconComponent && (
                                      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-white/10 rounded-lg">
                                        <IconComponent className="w-4.5 h-4.5 text-white/80" />
                                      </div>
                                    )}
                                    <span className="text-[15px] font-medium text-white/80">
                                      {t(subItem.key)}
                                    </span>
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={`/${locale}${navItem.href}`}
                    onClick={() => setOpen(false)}
                    target={navItem.target}
                    rel={navItem.target === "_blank" ? "noopener noreferrer" : undefined}
                    className="relative block w-full py-2 hover:opacity-70 transition-opacity"
                  >
                    <span className="block text-xl text-white font-semibold">
                      {t(navItem.key)}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col w-full items-start gap-4 px-6 py-5 border-t border-white/10 bg-black/20">
            <div className="w-full">
              <LanguageSwitcher />
            </div>
            {session.data?.user ? (
              <>
                <div className="flex flex-col gap-2 w-full">
                  <div className="pb-3 mb-2 border-b border-white/10">
                    <p className="text-[15px] font-semibold text-white">
                      {session.data.user.name || session.data.user.email}
                    </p>
                    {session.data.user.name && (
                      <p className="text-sm text-white/50 mt-1">
                        {session.data.user.email}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setOpen(false)}
                    className="text-[15px] font-medium text-white/60 py-2 hover:text-white transition-colors"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    href={`/${locale}/settings`}
                    onClick={() => setOpen(false)}
                    className="text-[15px] font-medium text-white/60 py-2 hover:text-white transition-colors"
                  >
                    {t('settings')}
                  </Link>
                  <Link
                    href={`/${locale}/profile`}
                    onClick={() => setOpen(false)}
                    className="text-[15px] font-medium text-white/60 py-2 hover:text-white transition-colors"
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setOpen(false);
                      router.push("/");
                      router.refresh();
                    }}
                    className="text-[15px] font-medium text-[#B7352D] py-2 text-left hover:opacity-80 transition-opacity"
                  >
                    {tCommon('signOut')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2.5 w-full">
                <Link
                  href={`/${locale}/signup`}
                  onClick={() => setOpen(false)}
                  className="w-full block text-center rounded-full bg-[#B7352D] hover:bg-[#9F2D27] text-white px-4 py-2.5 text-base font-semibold transition-colors"
                >
                  {tCommon('signUp')}
                </Link>
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setOpen(false)}
                  className="w-full block text-center rounded-full text-white/60 hover:text-white px-4 py-2.5 text-base font-medium transition-colors"
                >
                  {tCommon('signIn')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
