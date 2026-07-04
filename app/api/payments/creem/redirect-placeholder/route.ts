import { NextRequest, NextResponse } from "next/server";

// Simple placeholder used when CREEM_SIMULATE=true to emulate a successful redirect
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const redirectToParam = url.searchParams.get("redirectTo");
  const locale = url.searchParams.get("locale") === "en" ? "en" : "zh";
  const redirectTo = redirectToParam || `${appUrl}/${locale}/checkout/success`;
  return NextResponse.redirect(redirectTo);
}

export const dynamic = "force-dynamic";
