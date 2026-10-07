import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Locale } from "@/i18n/routing";
import type { Settings } from "@/lib/site";

// Public reads only; RLS hides inactive bouquets. Admin writes use a session client.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);

export type Option = { slug: string; name: string; hex?: string };

export type Bouquet = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  composition: string;
  price: number;
  oldPrice: number | null;
  size: "S" | "M" | "L" | "XL";
  heightCm: number | null;
  diameterCm: number | null;
  images: string[];
  popularity: number;
  rating: number | null;
  createdAt: string;
  occasions: string[];
  colors: string[];
};

export type Sort = "new" | "popular" | "cheap" | "expensive";

export type CatalogFilters = {
  q?: string;
  occasion?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: Sort;
};

const SELECT = "*, bouquet_occasions(occasion_slug), bouquet_colors(color_slug)";

type Row = {
  id: string;
  slug: string;
  price: number;
  old_price: number | null;
  size: Bouquet["size"];
  height_cm: number | null;
  diameter_cm: number | null;
  images: string[];
  popularity: number;
  rating: number | null;
  created_at: string;
  bouquet_occasions: { occasion_slug: string }[];
  bouquet_colors: { color_slug: string }[];
  [localized: string]: unknown;
};

function toBouquet(r: Row, l: Locale): Bouquet {
  return {
    id: r.id,
    slug: r.slug,
    name: r[`name_${l}`] as string,
    short: r[`short_${l}`] as string,
    description: r[`description_${l}`] as string,
    composition: r[`composition_${l}`] as string,
    price: r.price,
    oldPrice: r.old_price,
    size: r.size,
    heightCm: r.height_cm,
    diameterCm: r.diameter_cm,
    images: r.images,
    popularity: r.popularity,
    rating: r.rating === null ? null : Number(r.rating),
    createdAt: r.created_at,
    occasions: r.bouquet_occasions.map((o) => o.occasion_slug),
    colors: r.bouquet_colors.map((c) => c.color_slug),
  };
}

const order: Record<Sort, { column: string; ascending: boolean }> = {
  new: { column: "created_at", ascending: false },
  popular: { column: "popularity", ascending: false },
  cheap: { column: "price", ascending: true },
  expensive: { column: "price", ascending: false },
};

export async function getBouquets(locale: Locale, f: CatalogFilters = {}) {
  const inner = [
    f.occasion ? "bouquet_occasions!inner(occasion_slug)" : "bouquet_occasions(occasion_slug)",
    f.color ? "bouquet_colors!inner(color_slug)" : "bouquet_colors(color_slug)",
  ];
  let query = supabase.from("bouquets").select(`*, ${inner.join(", ")}`);

  if (f.q) {
    // Strip PostgREST filter syntax characters before building the or() clause.
    const q = f.q.replace(/[,()%*\\"]/g, " ").trim();
    if (q) query = query.or(`name_${locale}.ilike.*${q}*,short_${locale}.ilike.*${q}*`);
  }
  if (f.occasion) query = query.eq("bouquet_occasions.occasion_slug", f.occasion);
  if (f.color) query = query.eq("bouquet_colors.color_slug", f.color);
  if (f.minPrice) query = query.gte("price", f.minPrice);
  if (f.maxPrice) query = query.lte("price", f.maxPrice);

  const { column, ascending } = order[f.sort ?? "popular"];
  const { data, error } = await query.order(column, { ascending });
  if (error) throw error;

  // With an !inner filter the embedded list only holds the matched slug,
  // so refetch full tags for those ids.
  if (f.occasion || f.color) {
    const ids = (data as unknown as Row[]).map((r) => r.id);
    if (!ids.length) return [];
    const full = await supabase.from("bouquets").select(SELECT).in("id", ids);
    if (full.error) throw full.error;
    const byId = new Map((full.data as Row[]).map((r) => [r.id, r]));
    return ids.map((id) => toBouquet(byId.get(id)!, locale));
  }
  return (data as unknown as Row[]).map((r) => toBouquet(r, locale));
}

export async function getBouquet(locale: Locale, slug: string) {
  const { data, error } = await supabase
    .from("bouquets")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? toBouquet(data as Row, locale) : null;
}

export async function getPopular(locale: Locale, limit = 4) {
  return (await getBouquets(locale, { sort: "popular" })).slice(0, limit);
}

// Bouquets sharing the most occasions/colors with the given one.
export async function getSimilar(locale: Locale, b: Bouquet, limit = 4) {
  const all = await getBouquets(locale);
  const score = (x: Bouquet) =>
    x.occasions.filter((o) => b.occasions.includes(o)).length +
    x.colors.filter((c) => b.colors.includes(c)).length;
  return all
    .filter((x) => x.id !== b.id)
    .sort((x, y) => score(y) - score(x) || y.popularity - x.popularity)
    .slice(0, limit);
}

export async function getPriceRange() {
  const { data, error } = await supabase.from("bouquets").select("price");
  if (error) throw error;
  const prices = data.map((r) => r.price as number);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

async function getOptions(table: "occasions" | "colors", locale: Locale) {
  const { data, error } = await supabase.from(table).select("*").order("sort");
  if (error) throw error;
  return data.map((r) => ({ slug: r.slug, name: r[`name_${locale}`], hex: r.hex }) as Option);
}

export const getOccasions = (l: Locale) => getOptions("occasions", l);
export const getColors = (l: Locale) => getOptions("colors", l);

export type CartBouquet = { id: string; slug: string; name: string; price: number; image: string | null };

export async function getBouquetsByIds(locale: Locale, ids: string[]): Promise<CartBouquet[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("bouquets")
    .select(`id, slug, price, images, name_${locale}`)
    .in("id", ids);
  if (error) throw error;
  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r[`name_${locale}`] as string,
    price: r.price,
    image: r.images[0] ?? null,
  }));
}

export async function getBlockedDates() {
  const { data, error } = await supabase.from("blocked_dates").select("day");
  if (error) throw error;
  return data.map((r) => r.day as string);
}

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("shop_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return {
    phone: data.phone,
    whatsappPhone: data.whatsapp_phone,
    telegram: data.telegram,
    instagram: data.instagram,
    email: data.email,
    hours: data.hours,
    deliveryPrice: data.delivery_price,
    freeDeliveryFrom: data.free_delivery_from,
    giftPackagingPrice: data.gift_packaging_price,
    ribbonPrice: data.ribbon_price,
    slots: data.slots,
  };
}

export type OrderSummary = {
  number: number;
  total: number;
  delivery_method: "delivery" | "pickup";
  delivery_date: string;
  delivery_slot: string;
  address: string | null;
  recipient_name: string;
  customer_email: string;
  items_total: number;
  packaging_price: number;
  delivery_price: number;
  payment_method: "cash" | "online";
  card_enabled: boolean;
  items: { name: string; price: number; qty: number }[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrderSummary(id: string): Promise<OrderSummary | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await supabase.rpc("get_order_summary", { order_id: id });
  if (error) throw error;
  return data as OrderSummary | null;
}
