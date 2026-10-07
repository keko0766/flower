"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import type { CartBouquet } from "@/lib/data";
import { cart, useCart } from "@/lib/cart-store";
import type { Settings } from "@/lib/site";

export type CartItem = CartBouquet & { qty: number };

// Joins stored cart lines with fresh bouquet data and computes totals.
export function useCartItems(settings: Settings) {
  const locale = useLocale();
  const lines = useCart();
  const [data, setData] = useState<{ key: string; items: CartBouquet[] } | null>(null);

  const key = `${locale}:${lines.map((l) => l.id).sort().join(",")}`;

  useEffect(() => {
    const ids = key.split(":")[1];
    if (!ids) return;
    let cancelled = false;
    fetch(`/api/cart?locale=${locale}&ids=${ids}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((items: CartBouquet[]) => {
        if (cancelled) return;
        setData({ key, items });
        cart.keepOnly(items.map((i) => i.id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key, locale]);

  const loading = lines.length > 0 && data?.key !== key && !data;
  const byId = new Map((data?.items ?? []).map((i) => [i.id, i]));
  const items: CartItem[] = lines.flatMap((l) => {
    const b = byId.get(l.id);
    return b ? [{ ...b, qty: l.qty }] : [];
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= settings.freeDeliveryFrom ? 0 : settings.deliveryPrice;

  return {
    items,
    loading,
    isEmpty: lines.length === 0,
    subtotal,
    delivery,
    total: subtotal + delivery,
    toFree: Math.max(0, settings.freeDeliveryFrom - subtotal),
  };
}
