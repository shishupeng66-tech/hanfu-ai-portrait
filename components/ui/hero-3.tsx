"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  images: string[];
  backgroundImage?: string;
  className?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

const ActionButton = ({ children }: { children: React.ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    className="rounded-full bg-[#B7352D] px-8 py-3 font-semibold text-[#FFF8F0] shadow-md shadow-black/20 transition-colors hover:bg-[#9F2D27] focus:outline-none focus:ring-2 focus:ring-[#B7352D]/75"
  >
    {children}
  </motion.button>
);

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  backgroundImage,
  className,
}) => {
  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-start overflow-hidden px-4 text-center",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#030604]">
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        {/* Minimal top scrim for title readability */}
        <div className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
        {/* Bottom fade for marquee transition */}
        <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-[#030604]/70 to-transparent" />
      </div>

      <div className="z-10 flex flex-col items-center pt-[96px] md:pt-[124px]">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-[#C9A45C] backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="max-w-6xl text-5xl font-bold tracking-tighter text-[#F7F2EA] md:text-7xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeIn}
          transition={{ delay: 0.15 }}
          className="mt-5 max-w-xl text-lg leading-8 text-[#A8A29E]"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="mt-7"
        >
          <ActionButton>{ctaText}</ActionButton>
        </motion.div>
      </div>

      <div className="w-full mt-8 md:mt-10 pb-6 md:pb-8 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
        <motion.div
          className="flex gap-3 md:gap-4"
          animate={{
            x: ["-100%", "0%"],
            transition: {
              ease: "linear",
              duration: 40,
              repeat: Infinity,
            },
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={src + "-" + index}
              className="relative aspect-[3/4] h-48 flex-shrink-0 md:h-[320px]"
            >
              <Image
                src={src}
                alt={"Hanfu portrait example " + (index + 1)}
                fill
                sizes="(min-width: 768px) 240px, 144px"
                className="rounded-2xl border border-white/10 object-cover shadow-xl shadow-black/30"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
