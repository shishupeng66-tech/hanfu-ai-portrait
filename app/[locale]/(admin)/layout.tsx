import { requireAdmin } from "@/lib/auth/admin";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  return (
    <div className="admin-theme min-h-screen bg-[#0b0b0c] text-foreground">
      <div className="flex min-h-screen bg-[#0b0b0c]">
        <AdminSidebar />

        <div className="flex min-h-screen flex-1 flex-col bg-[#0b0b0c]">
          <AdminHeader />

          <main className="min-h-screen flex-1 bg-[#0b0b0c] p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
