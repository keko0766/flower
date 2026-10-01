"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { cart } from "@/lib/cart-store";
import { showToast } from "@/lib/toast";

export default function AddToCart({ id }: { id: string }) {
  const t = useTranslations();
  const [qty, setQty] = useState(1);

  return (
    <div className="mt-6 flex gap-3">
      <div
        className="flex items-center rounded-full border border-line bg-white"
        role="group"
        aria-label={t("product.quantity")}
      >
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
          aria-label={t("product.decrease")}
          className="p-3.5 disabled:opacity-30"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-medium" aria-live="polite">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          aria-label={t("product.increase")}
          className="p-3.5"
        >
          <Plus size={16} />
        </button>
      </div>
      <Button
        className="flex-1"
        onClick={() => {
          cart.add(id, qty);
          showToast(t("cart.added"));
          setQty(1);
        }}
      >
        {t("ui.addToCart")}
      </Button>
    </div>
  );
}
