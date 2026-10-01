"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cart } from "@/lib/cart-store";
import { showToast } from "@/lib/toast";

// Round "+" button on product cards.
export default function AddButton({ id }: { id: string }) {
  const t = useTranslations();

  return (
    <button
      onClick={() => {
        cart.add(id);
        showToast(t("cart.added"));
      }}
      aria-label={t("ui.addToCart")}
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush transition-colors hover:bg-blush-dark active:scale-95"
    >
      <Plus size={18} />
    </button>
  );
}
