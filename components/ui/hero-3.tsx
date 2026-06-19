"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: React.ReactNode;
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

const ActionButton = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const params = useParams();
  const session = useSession();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const isLoggedIn = !!session.data?.user;

  const handleClick = () => {
    if (isLoggedIn) {
      router.push(`/${locale}/generate`);
    } else {
      router.push(`/${locale}/login?callbackUrl=/${locale}/generate`);
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="h-14 cursor-pointer rounded-full bg-[#C83A32] px-9 text-base font-semibold text-[#FFF7EC] shadow-[0_0_28px_rgba(200,58,50,0.28)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[#D7463E] hover:shadow-[0_0_34px_rgba(200,58,50,0.42)] focus:outline-none focus:ring-2 focus:ring-[#E8C27A]/60 focus:ring-offset-2 focus:ring-offset-[#030604]"
    >
      {children}
    </motion.button>
  );
};

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

      <div className="z-10 flex flex-col items-center px-5 pt-[104px] md:pt-[128px]">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="mb-6 inline-block rounded-full border border-[#E8C27A]/35 bg-[rgba(120,35,30,0.35)] px-3.5 py-2 text-sm font-medium text-[#E8C27A] backdrop-blur-sm md:text-[15px]"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="w-full max-w-[1180px] text-[42px] font-bold leading-[1.05] tracking-[-0.03em] text-[#FFF7EC] sm:text-5xl md:text-[64px] md:leading-none lg:text-[68px] xl:text-[72px]"
        >
          {title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeIn}
          transition={{ delay: 0.15 }}
          className="mt-6 max-w-[720px] text-base leading-7 text-[rgba(255,247,236,0.72)] md:text-[19px] md:leading-8"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <ActionButton>{ctaText}</ActionButton>
        </motion.div>
      </div>

      <div className="mt-8 w-full pb-6 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] md:mt-10 md:pb-8">
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
