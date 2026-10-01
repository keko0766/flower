import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BouquetForm from "@/components/admin/BouquetForm";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Редактирование букета" };

export default async function EditBouquetPage({ params }: PageProps<"/admin/bouquets/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: b }, { data: occasions }, { data: colors }] = await Promise.all([
    supabase.from("bouquets").select("*, bouquet_occasions(occasion_slug), bouquet_colors(color_slug)").eq("id", id).maybeSingle(),
    supabase.from("occasions").select("slug, name_ru").order("sort"),
    supabase.from("colors").select("slug, name_ru").order("sort"),
  ]);
  if (!b) notFound();

  const initial = {
    slug: b.slug,
    name_ru: b.name_ru,
    name_kk: b.name_kk,
    short_ru: b.short_ru,
    short_kk: b.short_kk,
    description_ru: b.description_ru,
    description_kk: b.description_kk,
    composition_ru: b.composition_ru,
    composition_kk: b.composition_kk,
    price: b.price,
    old_price: b.old_price,
    size: b.size,
    height_cm: b.height_cm,
    diameter_cm: b.diameter_cm,
    images: b.images,
    is_active: b.is_active,
    occasions: (b.bouquet_occasions as { occasion_slug: string }[]).map((o) => o.occasion_slug),
    colors: (b.bouquet_colors as { color_slug: string }[]).map((c) => c.color_slug),
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-4xl">{b.name_ru}</h1>
      <a href={`/ru/catalog/${b.slug}`} target="_blank" className="mt-1 inline-block text-sm text-muted underline-offset-4 hover:underline">
        Открыть на сайте ↗
      </a>
      <BouquetForm id={b.id} initial={initial} occasions={occasions ?? []} colors={colors ?? []} />
    </div>
  );
}
