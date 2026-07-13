import { NextResponse } from "next/server";
import { getActiveSessionUser } from "@/lib/auth/session";

export async function requireAdminApi(requestHeaders: Headers) {
  const access = await getActiveSessionUser(requestHeaders);

  if (!access.ok) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: access.status === 403 ? 403 : 401 }
      ),
    };
  }

  if (access.user.role !== "admin") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    user: access.user,
  };
}
