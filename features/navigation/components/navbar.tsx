"use client";

import { DesktopNavbar } from "./desktop-navbar";
import { MobileNavbar } from "./mobile-navbar";

export function NavBar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 h-16 md:h-[72px] bg-transparent">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="hidden w-full lg:block">
          <DesktopNavbar />
        </div>
        <div className="flex h-full w-full items-center lg:hidden">
          <MobileNavbar />
        </div>
      </div>
    </header>
  );
}