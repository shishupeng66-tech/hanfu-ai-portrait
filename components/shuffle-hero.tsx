"use client";
import { motion } from "framer-motion";
import { LocaleLink } from "@/components/locale-link";
import Image from "next/image";

const galleryImages = [
  "/hero-1.png",
  "/hero-2.png",
  "/hero-3.png",
  "/hero-1.png",
  "/hero-2.png",
  "/hero-3.png",
  "/hero-3.png",
];

export const ShuffleHero = () => {
  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex items-center"
      style={{
        backgroundImage: "url(/hero-2.png)",
        backgroundSize: "cover",
        backgroundPosition: "left center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 深色底层遮罩 */}
      <div className="absolute inset-0 z-10 bg-black/50" />

      {/* 红金渐变叠层 */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(120,10,10,0.45) 0%, rgba(0,0,0,0.15) 50%, rgba(160,110,30,0.25) 100%)",
        }}
      />

      {/* 颗粒质感 */}
      <div
        className="absolute inset-0 z-10 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
        }}
      />

      {/* 内容区域 */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-8 md:px-16 flex items-center justify-between gap-12 py-24">

        {/* 中间文案 */}
        <div className="flex-1 flex flex-col items-center text-center max-w-xl mx-auto">

          {/* 装饰线 */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-amber-400/80" />
            <span
              className="text-xs tracking-[0.35em] uppercase font-light"
              style={{ color: "#D4A843" }}
            >
              Han Portrait
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-amber-400/80" />
          </motion.div>

          {/* 主标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white leading-tight mb-5 drop-shadow-lg"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
          >
            Wear Hanfu.
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #D4A843, #F5C842, #C8901C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Own the Story.
            </span>
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base md:text-lg text-white/75 mb-10 leading-relaxed max-w-md"
          >
            Upload your photo and receive a stunning AI-generated Hanfu portrait
            in minutes. No studio. No costume rental.
          </motion.p>

          {/* CTA 按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <LocaleLink
              href="/generate"
              className="inline-block font-semibold py-4 px-10 rounded-full transition-all active:scale-95 text-base shadow-lg text-white"
              style={{
                background: "linear-gradient(135deg, #9B1C1C 0%, #C0392B 50%, #9B1C1C 100%)",
                boxShadow: "0 4px 24px rgba(155,28,28,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Try Now — It&apos;s Free
            </LocaleLink>
            <LocaleLink
              href="/gallery"
              className="text-sm text-white/60 hover:text-white/90 transition-colors underline underline-offset-4 decoration-white/30"
            >
              View Gallery →
            </LocaleLink>
          </motion.div>

          {/* 信任标签 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2 mt-8 text-white/40 text-xs"
          >
            <span>✦</span>
            <span>No watermark on paid plans</span>
            <span>·</span>
            <span>Ready in under 2 min</span>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>✦</span>
          </motion.div>
        </div>

        {/* 右侧图片网格：上3下4 */}
        <div className="hidden lg:flex flex-col gap-2 flex-shrink-0 w-[380px] pr-4">
          {/* 上面3张 */}
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.slice(0, 3).map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="relative overflow-hidden rounded-xl"
                style={{
                  aspectRatio: "3/4",
                  height: "165px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,168,67,0.2)",
                }}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,67,0.5)" }}
              >
                <Image
                  src={src}
                  alt={`Hanfu portrait ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* 金色微光边框 */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.25)" }}
                />
              </motion.div>
            ))}
          </div>

          {/* 下面4张 */}
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.slice(3, 7).map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08 }}
                className="relative overflow-hidden rounded-lg"
                style={{
                  aspectRatio: "3/4",
                  height: "115px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,168,67,0.15)",
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,168,67,0.4)" }}
              >
                <Image
                  src={src}
                  alt={`Hanfu portrait ${i + 4}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(212,168,67,0.2)" }}
                />
              </motion.div>
            ))}
          </div>

          {/* 图片区域底部标注 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-right text-xs mt-1"
            style={{ color: "rgba(212,168,67,0.5)" }}
          >
            All portraits generated by AI
          </motion.p>
        </div>

      </div>
    </section>
  );
};

export default ShuffleHero;
