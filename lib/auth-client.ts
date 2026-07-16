"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Resolve the base URL for the Better Auth client.
 *
 * On the client, use the current origin so that API calls are same-origin,
 * which works on any Vercel deployment URL (including preview branches).
 *
 * During SSR, fall back to NEXT_PUBLIC_APP_URL so that initial server-rendered
 * content uses the production URL.
 */
function getBaseURL() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;