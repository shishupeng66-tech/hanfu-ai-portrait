"use client";

import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { useTranslations } from "next-intl";

const HANFU_IMAGES = [
  "/images/hanfu-hero/palace-red-01.jpg",
  "/images/hanfu-hero/jade-temple-01.jpg",
  "/images/hanfu-hero/spring-pink-01.jpg",
  "/images/hanfu-hero/festival-lantern-01.jpg",
  "/images/hanfu-hero/palace-red-02.jpg",
  "/images/hanfu-hero/palace-red-03.jpg",
  "/images/hanfu-hero/palace-red-01.jpg",
  "/images/hanfu-hero/jade-temple-01.jpg",
  "/images/hanfu-hero/spring-pink-01.jpg",
  "/images/hanfu-hero/festival-lantern-01.jpg",
];

export function HomeHero() {
  const t = useTranslations("hanfuHome.hero");

  return (
    <AnimatedMarqueeHero
      tagline={t("badge")}
      title={
        <>
          <span>{t("title")}</span>
          <br />
          <span className="text-[#E8C27A]">{t("titleNext")}</span>
        </>
      }
      description={t("subtitle")}
      ctaText={t("ctaPrimary")}
      images={HANFU_IMAGES}
      // Change the number to switch: hero-bg-1.png, hero-bg-2.png, hero-bg-3.png
      backgroundImage="/images/hero-bg/hero-bg-10.png"
    />
  );
}
