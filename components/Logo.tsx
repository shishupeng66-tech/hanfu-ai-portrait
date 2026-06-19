"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

export const Logo = () => {
  const locale = useLocale();
  const isZh = locale === "zh";
  const brandName = isZh ? "汉韵写真" : "Han Portrait";

  return (
    <Link
      href={`/${locale}`}
      className="relative z-20 mr-4 flex items-center gap-3 px-2 py-1"
      aria-label={isZh ? "汉韵写真首页" : "Han Portrait home"}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
        <Image
          src="/brand/logo-mark.png"
          alt={brandName}
          width={48}
          height={48}
          className="h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(232,194,122,0.28)]"
          priority
        />
      </div>

      {isZh ? (
        <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#E8C27A]">
          汉韵写真
        </span>
      ) : (
        <span className="text-[20px] font-semibold tracking-[-0.02em]">
          <span className="text-[#FFF7EC]">Han</span>
          <span className="text-[#E8C27A]"> Portrait</span>
        </span>
      )}
    </Link>
  );
};
