"use client";

import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

export const FILTER_KEYS = ["q", "occasion", "color", "min", "max", "sort"] as const;
type Key = (typeof FILTER_KEYS)[number];

// Reads and writes catalog filters in the URL query string.
export function useCatalogParams() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(changes: Partial<Record<Key, string | undefined>>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  const reset = () =>
    set(Object.fromEntries(FILTER_KEYS.map((k) => [k, undefined])));

  const activeCount = (["occasion", "color", "min", "max", "q"] as const).filter((k) =>
    params.get(k),
  ).length;

  return { get: (k: Key) => params.get(k) ?? "", set, reset, pending, activeCount };
}
