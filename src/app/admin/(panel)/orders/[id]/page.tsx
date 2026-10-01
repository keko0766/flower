import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import StatusButtons from "@/components/admin/StatusButtons";
import { type Status, fmtDate } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Заказ" };

const tel = (p: string) => `tel:+${p.replace(/\D/g, "")}`;
const wa = (p: string) => `https://wa.me/${p.replace(/\D/g, "")}`;

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: o } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!o) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-muted hover:text-rose">
        <ArrowLeft size={16} /> Все заказы
      </Link>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-4xl">Заказ №{o.number}</h1>
        <p className="text-sm text-muted">
          создан {new Date(o.created_at).toLocaleString("ru-RU", { timeZone: "Asia/Almaty", dateStyle: "medium", timeStyle: "short" })} · {o.locale === "kk" ? "казахский" : "русский"}
        </p>
      </div>

      <div className="mt-6 rounded-[20px] bg-white p-5">
        <p className="mb-3 text-xs uppercase tracking-[0.12em] text-muted">Статус</p>
        <StatusButtons id={o.id} status={o.status as Status} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Заказчик">
          <p className="font-medium">{o.customer_name}</p>
          <Phone value={o.customer_phone} />
          <a href={`mailto:${o.customer_email}`} className="block text-sm hover:text-rose">{o.customer_email}</a>
        </Card>
        <Card title="Получатель">
          <p className="font-medium">{o.recipient_name}</p>
          <Phone value={o.recipient_phone} />
        </Card>
        <Card title={o.delivery_method === "pickup" ? "Самовывоз" : "Доставка"}>
          <p className="font-medium">{fmtDate(o.delivery_date)}, {o.delivery_slot.replace("-", "–")}</p>
          {o.delivery_method === "delivery" && (
            <>
              <p>{o.address}</p>
              <p className="text-sm text-muted">
                {[o.apartment && `кв. ${o.apartment}`, o.floor && `этаж ${o.floor}`, o.entrance_code && `код ${o.entrance_code}`].filter(Boolean).join(" · ") || "—"}
              </p>
            </>
          )}
        </Card>
        <Card title="Оформление">
          <p>Упаковка: {o.packaging === "gift" ? "подарочная" : "стандартная"}{o.ribbon ? " + лента" : ""}</p>
          <p>Оплата: {o.payment_method === "cash" ? "при получении" : "онлайн"}</p>
          {o.card_enabled ? (
            <div className="mt-2 rounded-xl bg-cream p-3 text-sm">
              <p className="text-xs text-muted">Открытка {o.card_to && `· кому: ${o.card_to}`} {o.card_from && `· от: ${o.card_from}`}</p>
              <p className="mt-1 whitespace-pre-line">{o.card_text || "(без текста)"}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">Без открытки</p>
          )}
        </Card>
      </div>

      {o.comment && (
        <div className="mt-4 rounded-[20px] bg-blush/40 p-5 text-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Комментарий</p>
          <p className="mt-1 whitespace-pre-line">{o.comment}</p>
        </div>
      )}

      <div className="mt-4 rounded-[20px] bg-white p-5 text-sm">
        <ul className="space-y-2">
          {(o.order_items as { id: number; name: string; price: number; quantity: number }[]).map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>{i.name} <span className="text-muted">× {i.quantity}</span></span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-line pt-4">
          <div className="flex justify-between"><dt className="text-muted">Товары</dt><dd>{formatPrice(o.items_total)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Упаковка</dt><dd>{formatPrice(o.packaging_price)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Доставка</dt><dd>{formatPrice(o.delivery_price)}</dd></div>
          <div className="flex justify-between pt-2 text-lg font-semibold"><dt>Итого</dt><dd>{formatPrice(o.total)}</dd></div>
        </dl>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1 rounded-[20px] bg-white p-5">
      <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted">{title}</p>
      {children}
    </section>
  );
}

function Phone({ value }: { value: string }) {
  return (
    <p className="flex flex-wrap gap-x-3 text-sm">
      <a href={tel(value)} className="hover:text-rose">{value}</a>
      <a href={wa(value)} target="_blank" rel="noopener" className="text-whatsapp hover:underline">WhatsApp</a>
    </p>
  );
}
