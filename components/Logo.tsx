"use client";

import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="relative z-20 mr-4 flex items-center gap-2.5 px-2 py-1">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F7F2EA] ring-1 ring-white/20">
        <Image
          src="/brand/logo-temp.jpg"
          alt="HanPortrait"
          width={44}
          height={44}
          className="scale-125 object-cover object-[50%_22%]"
          unoptimized
        />
      </div>
      <span className="text-sm font-semibold text-[#F7F2EA]">HanPortrait</span>
    </Link>
  );
};
