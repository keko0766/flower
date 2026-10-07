"use server";

import { createClient } from "@supabase/supabase-js";

export type OrderPayload = {
  locale: string;
  customer_name: string;
  customer_phone: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_method: "delivery" | "pickup";
  address?: string;
  apartment?: string;
  floor?: string;
  entrance_code?: string;
  delivery_date: string;
  delivery_slot: string;
  card_enabled: boolean;
  card_text?: string;
  card_from?: string;
  card_to?: string;
  packaging: "standard" | "gift";
  ribbon: boolean;
  payment_method: "cash" | "online";
  comment?: string;
  consent: boolean;
  items: { id: string; qty: number }[];
};

const KNOWN_ERRORS = ["invalid_date", "invalid_item", "empty_cart"];

// Prices and totals are computed inside create_order(); the client only sends ids and quantities.
export async function placeOrder(
  payload: OrderPayload,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await supabase.rpc("create_order", { payload });
  if (error) {
    const code = KNOWN_ERRORS.find((c) => error.message.includes(c));
    if (!code) console.error("create_order failed:", error.message);
    return { ok: false, error: code ?? "server" };
  }
  return { ok: true, id: (data as { id: string }).id };
}
