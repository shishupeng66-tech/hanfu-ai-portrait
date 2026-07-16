import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "./db";
import { refundCredits } from "./credits";
import { getGoogleAuthProvider } from "./auth/google-auth";

function parseOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Build a trusted origin from a domain that may not include the protocol.
 * Vercel system env vars (VERCEL_URL, VERCEL_PROJECT_PRODUCTION_URL) omit
 * the protocol, so we prepend "https://" before parsing.
 */
function parseDomainAsOrigin(value: string | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // If it already looks like a URL with scheme, parse directly
  if (/^https?:\/\//i.test(trimmed)) {
    return parseOrigin(trimmed);
  }
  return parseOrigin(`https://${trimmed}`);
}

const trustedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      parseOrigin(process.env.BETTER_AUTH_URL),
      parseOrigin(process.env.NEXT_PUBLIC_APP_URL),
      // Vercel system env vars — domain only, no protocol
      parseDomainAsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
      parseDomainAsOrigin(process.env.VERCEL_URL),
      // Admin-defined extra origins
      ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
        ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
            .map((origin) => origin.trim())
            .filter(Boolean)
        : []),
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);

const googleAuthProvider = getGoogleAuthProvider();

// Diagnostic logging (safe — no secrets)
console.log("[Auth] baseURL:", process.env.BETTER_AUTH_URL || "(not set, default localhost)");
console.log("[Auth] NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "(not set)");
console.log("[Auth] VERCEL_ENV:", process.env.VERCEL_ENV || "(not set)");
console.log("[Auth] trustedOrigins:", trustedOrigins);
console.log("[Auth] Google OAuth enabled:", googleAuthProvider !== null);
console.log("[Auth] DATABASE_URL configured:", Boolean(process.env.DATABASE_URL));

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },
  ...(googleAuthProvider
    ? {
        socialProviders: {
          google: googleAuthProvider,
        },
      }
    : {}),

  trustedOrigins,

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Listen for user registration events (email and OAuth)
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          try {
            // Grant 3 credits as registration bonus
            await refundCredits(
              newSession.user.id,
              3,
              "registration_bonus"
            );
            console.log(`[Auth] New user registered, granted 3 credits: ${newSession.user.email}`);
          } catch (error) {
            console.error("[Auth] Failed to grant registration bonus:", error);
          }
        }
      }
    }),
  },
});

export { hashPassword } from "better-auth/crypto";