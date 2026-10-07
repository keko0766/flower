"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { MAX_QTY, cart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Settings } from "@/lib/site";
import { useCartItems } from "./useCartItems";

export default function CartView({ settings }: { settings: Settings }) {
  const t = useTranslations("cart");
  const tp = useTranslations("product");
  const { items, loading, isEmpty, subtotal, delivery, total, toFree } = useCartItems(settings);

  if (isEmpty) {
    return (
      <div className="mx-auto mt-12 flex max-w-md flex-col items-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-white text-blush-dark">
          <ShoppingBag size={32} />
        </span>
        <p className="mt-6 font-serif text-3xl">{t("empty")}</p>
        <p className="mt-2 text-muted">{t("emptyText")}</p>
        <Button href="/catalog" className="mt-8">{t("continue")}</Button>
      </div>
    );
  }

  if (loading) {
    return <p className="mt-10 text-muted">{t("loading")}</p>;
  }

  const progress = Math.min(100, (subtotal / settings.freeDeliveryFrom) * 100);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-line rounded-[20px] bg-white px-4 md:px-6">
        {items.map((i) => (
          <li key={i.id} className="flex gap-4 py-5">
            <Link
              href={`/catalog/${i.slug}`}
              className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-blush md:size-28"
            >
              {i.image && <Image src={i.image} alt={i.name} fill sizes="112px" className="object-cover" />}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/catalog/${i.slug}`} className="font-serif text-xl hover:text-rose md:text-2xl">
                  {i.name}
                </Link>
                <button
                  onClick={() => cart.remove(i.id)}
                  aria-label={t("remove")}
                  className="-mr-2 -mt-1 p-2 text-muted transition-colors hover:text-rose"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-sm text-muted">{formatPrice(i.price)}</p>

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-full border border-line" role="group" aria-label={tp("quantity")}>
                  <button
                    onClick={() => cart.change(i.id, -1)}
                    disabled={i.qty <= 1}
                    aria-label={tp("decrease")}
                    className="p-2.5 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center text-sm font-medium">{i.qty}</span>
                  <button
                    onClick={() => cart.change(i.id, 1)}
                    disabled={i.qty >= MAX_QTY}
                    aria-label={tp("increase")}
                    className="p-2.5 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-semibold">{formatPrice(i.price * i.qty)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-[20px] bg-white p-5 md:p-6 lg:sticky lg:top-28">
        <div className="rounded-xl bg-cream p-4 text-sm">
          <p>{toFree > 0 ? t("toFree", { amount: formatPrice(toFree) }) : t("freeReached")}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">
              {t("subtotal")} ({t("items", { count: items.reduce((n, i) => n + i.qty, 0) })})
            </dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{t("delivery")}</dt>
            <dd>{delivery ? t("deliveryFrom", { price: formatPrice(delivery) }) : t("deliveryFree")}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
            <dt>{t("total")}</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <Button href="/checkout" className="mt-6 w-full">{t("checkout")}</Button>
        <Button href="/catalog" variant="outline" className="mt-3 w-full">{t("continue")}</Button>
      </aside>
    </div>
  );
}
