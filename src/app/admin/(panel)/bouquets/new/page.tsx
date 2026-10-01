import type { Metadata } from "next";
import BouquetForm from "@/components/admin/BouquetForm";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Новый букет" };

export default async function NewBouquetPage() {
  const { supabase } = await requireAdmin();
  const [{ data: occasions }, { data: colors }] = await Promise.all([
    supabase.from("occasions").select("slug, name_ru").order("sort"),
    supabase.from("colors").select("slug, name_ru").order("sort"),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-4xl">Новый букет</h1>
      <BouquetForm id={null} occasions={occasions ?? []} colors={colors ?? []} />
    </div>
  );
}
