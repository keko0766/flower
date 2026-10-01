"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";

// Every action re-checks the admin session; RLS (is_admin()) enforces it again in the database.

const STATUSES = ["new", "preparing", "delivering", "done", "cancelled"] as const;
export type OrderStatus = (typeof STATUSES)[number];

function refreshShop() {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  if (!STATUSES.includes(status)) throw new Error("bad status");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export type BouquetInput = {
  slug: string;
  name_ru: string;
  name_kk: string;
  short_ru: string;
  short_kk: string;
  description_ru: string;
  description_kk: string;
  composition_ru: string;
  composition_kk: string;
  price: number;
  old_price: number | null;
  size: "S" | "M" | "L" | "XL";
  height_cm: number | null;
  diameter_cm: number | null;
  images: string[];
  is_active: boolean;
  occasions: string[];
  colors: string[];
};

export async function saveBouquet(id: string | null, input: BouquetInput) {
  const { supabase } = await requireAdmin();
  const { occasions, colors, ...row } = input;
  row.slug = row.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (!row.slug || !row.name_ru.trim() || !row.name_kk.trim() || !(row.price > 0)) {
    return { error: "Заполните адрес (slug), названия и цену" };
  }

  const res = id
    ? await supabase.from("bouquets").update(row).eq("id", id).select("id").single()
    : await supabase.from("bouquets").insert(row).select("id").single();
  if (res.error) {
    return { error: res.error.code === "23505" ? "Такой адрес (slug) уже занят" : res.error.message };
  }
  const bouquetId = res.data.id as string;

  await supabase.from("bouquet_occasions").delete().eq("bouquet_id", bouquetId);
  await supabase.from("bouquet_colors").delete().eq("bouquet_id", bouquetId);
  if (occasions.length) {
    await supabase.from("bouquet_occasions").insert(occasions.map((o) => ({ bouquet_id: bouquetId, occasion_slug: o })));
  }
  if (colors.length) {
    await supabase.from("bouquet_colors").insert(colors.map((c) => ({ bouquet_id: bouquetId, color_slug: c })));
  }

  refreshShop();
  revalidatePath("/admin", "layout");
  redirect("/admin/bouquets");
}

export async function deleteBouquet(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("bouquets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refreshShop();
  revalidatePath("/admin", "layout");
  redirect("/admin/bouquets");
}

export async function addBlockedDate(day: string, note: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { error: "Неверная дата" };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("blocked_dates").upsert({ day, note: note.trim() || null });
  if (error) return { error: error.message };
  revalidatePath("/admin/dates");
  return { error: null };
}

export async function removeBlockedDate(day: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("blocked_dates").delete().eq("day", day);
  revalidatePath("/admin/dates");
}
