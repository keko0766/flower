"use client";

import { useSyncExternalStore } from "react";

// Only ids and quantities are stored; names and prices are always loaded fresh.
export type CartLine = { id: string; qty: number };

const KEY = "akgul-cart";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed)
      ? parsed.filter((l) => typeof l?.id === "string" && Number.isInteger(l?.qty) && l.qty > 0)
      : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const MAX_QTY = 99;

export const cart = {
  add(id: string, qty = 1) {
    const lines = read();
    const existing = lines.find((l) => l.id === id);
    write(
      existing
        ? lines.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
        : [...lines, { id, qty: Math.min(MAX_QTY, qty) }],
    );
  },
  change(id: string, delta: number) {
    write(
      read().map((l) =>
        l.id === id ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, l.qty + delta)) } : l,
      ),
    );
  },
  remove(id: string) {
    write(read().filter((l) => l.id !== id));
  },
  keepOnly(ids: string[]) {
    const lines = read();
    const next = lines.filter((l) => ids.includes(l.id));
    if (next.length !== lines.length) write(next);
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartCount() {
  return useCart().reduce((n, l) => n + l.qty, 0);
}
