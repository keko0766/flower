import type { Metadata } from "next";
import BlockedDates from "@/components/admin/BlockedDates";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Недоступные даты" };

export default async function DatesPage() {
  const { supabase } = await requireAdmin();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Almaty" });
  const { data } = await supabase.from("blocked_dates").select("day, note").gte("day", today).order("day");

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">Недоступные даты</h1>
      <p className="mt-2 text-sm text-muted">В эти дни покупатели не смогут выбрать доставку или самовывоз.</p>
      <BlockedDates dates={data ?? []} />
    </div>
  );
}
