"use client";

import { DesktopNavbar } from "./desktop-navbar";
import { MobileNavbar } from "./mobile-navbar";

export function NavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#050505]">
      <nav className="mx-4 mt-4 flex h-12 items-center rounded-full bg-white text-black shadow-sm">
        <div className="hidden w-full lg:block">
          <DesktopNavbar />
        </div>
        <div className="flex h-full w-full items-center lg:hidden">
          <MobileNavbar />
        </div>
      </nav>
    </header>
  );
}