"use client";

import { useCartCount } from "@/lib/cart-store";

export default function CartBadge() {
  const count = useCartCount();
  if (!count) return null;
  return (
    <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
