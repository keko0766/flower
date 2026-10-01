import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/supabase/server";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <AdminNav email={user.email ?? ""} />
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
