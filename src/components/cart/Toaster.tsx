"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/lib/toast";

export default function Toaster() {
  const toast = useToast();
  const t = useTranslations("cart");
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm animate-[toast-in_.25s_ease-out] items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-lg md:bottom-6"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-blush text-ink">
        <Check size={14} />
      </span>
      <span className="flex-1">{toast.text}</span>
      <Link href="/cart" className="font-medium text-blush underline-offset-4 hover:underline">
        {t("goToCart")}
      </Link>
    </div>
  );
}
