"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizePhone } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/lib/supabase/server";

// Every action re-checks the admin session; RLS (is_admin()) enforces it again in the database.

const STATUSES = ["new", "sold", "cancelled"] as const;
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

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

// Free slug for a bouquet: base, base-2, base-3 … (the bouquet itself is ignored when renaming).
async function uniqueSlug(supabase: Supabase, base: string, selfId: string | null) {
  const root = base || "bouquet";
  const { data } = await supabase.from("bouquets").select("id, slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== selfId).map((r) => r.slug as string));
  if (!taken.has(root)) return root;
  for (let n = 2; ; n++) if (!taken.has(`${root}-${n}`)) return `${root}-${n}`;
}

export async function saveBouquet(id: string | null, input: BouquetInput) {
  const { supabase } = await requireAdmin();
  const { occasions, colors, ...row } = input;
  if (!row.name_ru.trim()) return { error: "Введите название букета" };
  if (!row.images.length) return { error: "Добавьте хотя бы одно фото" };
  if (!(row.price > 0)) return { error: "Укажите цену" };

  // Only the Russian name, a photo and a price are required: the rest is filled in automatically.
  row.slug = await uniqueSlug(supabase, slugify(row.slug) || slugify(row.name_ru), id);
  for (const k of ["name", "short", "description", "composition"] as const) {
    if (!row[`${k}_kk`].trim()) row[`${k}_kk`] = row[`${k}_ru`];
  }

  const res = id
    ? await supabase.from("bouquets").update(row).eq("id", id).select("id").single()
    : await supabase.from("bouquets").insert(row).select("id").single();
  if (res.error) {
    return { error: res.error.code === "23505" ? "Букет с таким адресом уже есть, попробуйте ещё раз" : res.error.message };
  }
  const bouquetId = res.data.id as string;

  await setLinks(supabase, bouquetId, occasions, colors);

  refreshShop();
  revalidatePath("/admin", "layout");
  redirect("/admin/bouquets");
}

async function setLinks(supabase: Supabase, bouquetId: string, occasions: string[], colors: string[]) {
  await supabase.from("bouquet_occasions").delete().eq("bouquet_id", bouquetId);
  await supabase.from("bouquet_colors").delete().eq("bouquet_id", bouquetId);
  if (occasions.length) {
    await supabase.from("bouquet_occasions").insert(occasions.map((o) => ({ bouquet_id: bouquetId, occasion_slug: o })));
  }
  if (colors.length) {
    await supabase.from("bouquet_colors").insert(colors.map((c) => ({ bouquet_id: bouquetId, color_slug: c })));
  }
}

export async function setBouquetActive(id: string, active: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("bouquets").update({ is_active: active }).eq("id", id);
  if (error) throw new Error(error.message);
  refreshShop();
  revalidatePath("/admin", "layout");
}

// Copy of a bouquet (hidden from the site) to open for editing, e.g. same bouquet in another size.
export async function duplicateBouquet(id: string) {
  const { supabase } = await requireAdmin();
  const { data: b, error } = await supabase
    .from("bouquets")
    .select("*, bouquet_occasions(occasion_slug), bouquet_colors(color_slug)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  const { bouquet_occasions, bouquet_colors, ...rest } = b;
  const copy = { ...rest, name_ru: `${b.name_ru} (копия)`, name_kk: `${b.name_kk} (көшірме)`, is_active: false };
  for (const k of ["id", "created_at", "popularity", "rating"]) delete copy[k];
  copy.slug = await uniqueSlug(supabase, `${b.slug}-kopiya`, null);

  const res = await supabase.from("bouquets").insert(copy).select("id").single();
  if (res.error) throw new Error(res.error.message);
  await setLinks(
    supabase,
    res.data.id,
    (bouquet_occasions as { occasion_slug: string }[]).map((o) => o.occasion_slug),
    (bouquet_colors as { color_slug: string }[]).map((c) => c.color_slug),
  );

  revalidatePath("/admin", "layout");
  redirect(`/admin/bouquets/${res.data.id}`);
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

export type SettingsInput = {
  phone: string;
  whatsappPhone: string;
  telegram: string;
  instagram: string;
  email: string;
  hours: string;
  deliveryPrice: number;
  freeDeliveryFrom: number;
  giftPackagingPrice: number;
  ribbonPrice: number;
  slots: string[];
};

// "@name", "name" or a full link → link; empty → null (the button is hidden on the site).
function socialLink(raw: string, base: string, nameRe: RegExp, strip: RegExp): string | null | undefined {
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const name = v.replace(strip, "").replace(/^@/, "").replace(/\/+$/, "");
  return nameRe.test(name) ? `${base}${name}` : undefined;
}

export async function saveSettings(input: SettingsInput) {
  const { supabase } = await requireAdmin();

  const phone = input.phone.trim();
  if (normalizePhone(phone).length < 10 || normalizePhone(phone).length > 15) return { error: "Проверьте номер телефона" };
  const waDigits = normalizePhone(input.whatsappPhone);
  if (waDigits && (waDigits.length < 10 || waDigits.length > 15)) return { error: "Проверьте номер WhatsApp" };
  const telegram = socialLink(input.telegram, "https://t.me/", /^[A-Za-z0-9_]{4,}$/, /^(https?:\/\/)?(t\.me|telegram\.me)\//i);
  if (telegram === undefined) return { error: "Telegram: укажите @имя или ссылку" };
  const instagram = socialLink(input.instagram, "https://instagram.com/", /^[A-Za-z0-9._]+$/, /^(https?:\/\/)?(www\.)?instagram\.com\//i);
  if (instagram === undefined) return { error: "Instagram: укажите @имя или ссылку" };
  const email = input.email.trim();
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Проверьте email" };
  const hours = input.hours.trim();
  if (!hours || hours.length > 40) return { error: "Укажите часы работы (до 40 символов)" };

  const prices = [input.deliveryPrice, input.freeDeliveryFrom, input.giftPackagingPrice, input.ribbonPrice];
  if (prices.some((n) => !Number.isInteger(n) || n < 0 || n > 10_000_000)) return { error: "Цены должны быть целыми числами от 0" };

  const slots = [...new Set(input.slots.map((s) => s.trim()))].sort();
  if (!slots.length || slots.length > 8) return { error: "Нужно от 1 до 8 интервалов доставки" };
  if (!slots.every((s) => /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/.test(s) && s.slice(0, 5) < s.slice(6))) {
    return { error: "В каждом интервале время «с» должно быть раньше времени «до»" };
  }

  const { error } = await supabase
    .from("shop_settings")
    .update({
      phone,
      whatsapp_phone: waDigits || null,
      telegram,
      instagram,
      email: email || null,
      hours,
      delivery_price: input.deliveryPrice,
      free_delivery_from: input.freeDeliveryFrom,
      gift_packaging_price: input.giftPackagingPrice,
      ribbon_price: input.ribbonPrice,
      slots,
    })
    .eq("id", 1);
  if (error) return { error: error.message };

  refreshShop();
  revalidatePath("/admin/settings");
  return { error: null };
}
