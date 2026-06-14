"use client";

import { AnimatedMarqueeHero } from "@/components/ui/hero-3";

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
  return (
    <AnimatedMarqueeHero
      tagline="AI Hanfu Portrait Generator"
      title={
        <>
          Professional Hanfu Portraits
          <br />
          Without the Photoshoot
        </>
      }
      description="Upload one photo. Choose a style. Get studio-quality Hanfu portraits in minutes."
      ctaText="Create My Portrait"
      images={HANFU_IMAGES}
    />
  );
}
