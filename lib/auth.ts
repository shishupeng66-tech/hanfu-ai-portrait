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

const trustedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      parseOrigin(process.env.BETTER_AUTH_URL),
      parseOrigin(process.env.NEXT_PUBLIC_APP_URL),
      ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
        ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
            .map((origin) => origin.trim())
            .filter(Boolean)
        : []),
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);

const googleAuthProvider = getGoogleAuthProvider();

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
