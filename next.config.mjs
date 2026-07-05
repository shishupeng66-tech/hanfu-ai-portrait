import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');
const withMDX = createMDX();
const rootDir = path.dirname(fileURLToPath(import.meta.url));

function envHostname(value) {
  if (!value) return null;

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const allowedDevOrigins = [
  envHostname(process.env.NEXT_PUBLIC_APP_URL),
  envHostname(process.env.BETTER_AUTH_URL),
].filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  turbopack: {
    root: rootDir,
  },
  allowedDevOrigins,
};

export default withNextIntl(withMDX(nextConfig));
