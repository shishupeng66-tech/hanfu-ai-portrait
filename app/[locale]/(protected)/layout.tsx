import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmailVerifiedGuard } from "@/features/auth/components/email-verified-guard";
import { getActiveSessionUser } from "@/lib/auth/session";
import { AppSidebar } from "@/features/navigation/components/app-sidebar";

export default async function ProtectedLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  const access = await getActiveSessionUser(await headers());
  if (!access.ok) {
    // Redirect to login with callbackUrl so users come back after signing in
    const callbackPath = `/${locale}/generate`;
    redirect(`/${locale}/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  return (
    <EmailVerifiedGuard requireEmailVerification={true}>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 ml-[260px]">
          {children}
        </main>
      </div>
    </EmailVerifiedGuard>
  );
}
