import type { Metadata } from "next";
import Link from "next/link";
import { STATUS, type Status, fmtDate } from "@/lib/admin";
import QuickStatus from "@/components/admin/QuickStatus";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Заказы" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { supabase } = await requireAdmin();
  const { status } = await searchParams;
  const filter = typeof status === "string" && status in STATUS ? (status as Status) : null;

  let query = supabase
    .from("orders")
    .select("id, number, status, recipient_name, customer_phone, delivery_method, delivery_date, delivery_slot, total, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter) query = query.eq("status", filter);
  const { data: orders } = await query;

  const tab = (s: Status | null, label: string) => (
    <Link
      href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
      className={`shrink-0 rounded-full px-4 py-2 text-sm ${filter === s ? "bg-ink text-white" : "bg-white hover:bg-blush/40"}`}
    >
      {label}
    </Link>
  );

  return (
    <div>
      <h1 className="font-serif text-4xl">Заказы</h1>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tab(null, "Все")}
        {(Object.keys(STATUS) as Status[]).map((s) => tab(s, STATUS[s].label))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-[20px] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="p-4">№</th>
              <th className="p-4">Доставка</th>
              <th className="p-4">Получатель</th>
              <th className="p-4">Сумма</th>
              <th className="p-4">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-cream/60">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">
                    {o.number}
                  </Link>
                  <p className="text-xs text-muted">{fmtDate(o.created_at)}</p>
                </td>
                <td className="p-4">
                  {fmtDate(o.delivery_date)}, {o.delivery_slot.replace("-", "–")}
                  <p className="text-xs text-muted">{o.delivery_method === "pickup" ? "Самовывоз" : "Доставка"}</p>
                </td>
                <td className="p-4">
                  {o.recipient_name}
                  <p className="text-xs text-muted">{o.customer_phone}</p>
                </td>
                <td className="p-4 font-medium">{formatPrice(o.total)}</td>
                <td className="p-4">
                  <QuickStatus id={o.id} number={o.number} status={o.status as Status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length && <p className="p-8 text-center text-muted">Заказов нет</p>}
      </div>
    </div>
  );
}
