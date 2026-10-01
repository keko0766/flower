import Link from "next/link";
import { STATUS, type Status } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";

type Row = {
  status: Status;
  total: number;
  created_at: string;
  order_items: { name: string; quantity: number }[];
};

const daysAgoIso = (n: number) =>
  new Date(Date.now() - n * 864e5).toISOString();
const sum = (l: Row[]) => l.reduce((s, o) => s + o.total, 0);

function computeStats(orders: Row[]) {
  const today = almatyDay(new Date());
  const within = (days: number) => {
    const from = almatyDay(new Date(Date.now() - (days - 1) * 864e5));
    return orders.filter((o) => almatyDay(new Date(o.created_at)) >= from);
  };
  const periods = [
    {
      label: "Сегодня",
      list: orders.filter((o) => almatyDay(new Date(o.created_at)) === today),
    },
    { label: "7 дней", list: within(7) },
    { label: "30 дней", list: orders },
  ];

  const top = new Map<string, number>();
  orders.forEach((o) =>
    o.order_items.forEach((i) =>
      top.set(i.name, (top.get(i.name) ?? 0) + i.quantity),
    ),
  );
  const topList = [...top].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = almatyDay(new Date(Date.now() - (13 - i) * 864e5));
    return {
      d,
      n: orders.filter((o) => almatyDay(new Date(o.created_at)) === d).length,
    };
  });
  const maxN = Math.max(1, ...days.map((x) => x.n));
  return { periods, topList, days, maxN };
}

const almatyDay = (d: Date) =>
  d.toLocaleDateString("en-CA", { timeZone: "Asia/Almaty" });

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("orders")
    .select("status, total, created_at, order_items(name, quantity)")
    .gte("created_at", daysAgoIso(30));
  const orders = ((data ?? []) as Row[]).filter(
    (o) => o.status !== "cancelled",
  );

  const { periods, topList, days, maxN } = computeStats(orders);
  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">Обзор</h1>
        {newCount > 0 && (
          <Link
            href="/admin/orders?status=new"
            className={`rounded-full px-4 py-2 text-sm ${STATUS.new.cls}`}
          >
            Новых заказов: {newCount} →
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {periods.map((p) => (
          <div key={p.label} className="rounded-[20px] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              {p.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {formatPrice(sum(p.list))}
            </p>
            <p className="mt-1 text-sm text-muted">
              {p.list.length} заказ(ов) · средний чек{" "}
              {formatPrice(
                p.list.length ? Math.round(sum(p.list) / p.list.length) : 0,
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[20px] bg-white p-5">
          <h2 className="font-serif text-2xl">Заказы за 14 дней</h2>
          <div
            className="mt-6 flex h-40 items-end gap-1.5"
            role="img"
            aria-label="Количество заказов по дням"
          >
            {days.map((x) => (
              <div
                key={x.d}
                className="group flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-[10px] text-muted opacity-0 group-hover:opacity-100">
                  {x.n}
                </span>
                <div
                  className="w-full rounded-t-md bg-blush-dark"
                  style={{ height: `${(x.n / maxN) * 120 + 2}px` }}
                />
                <span className="text-[10px] text-muted">{x.d.slice(8)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] bg-white p-5">
          <h2 className="font-serif text-2xl">Топ-5 букетов</h2>
          {topList.length ? (
            <ol className="mt-4 space-y-2 text-sm">
              {topList.map(([name, qty], i) => (
                <li key={name} className="flex justify-between gap-3">
                  <span>
                    <span className="text-muted">{i + 1}.</span> {name}
                  </span>
                  <span className="text-muted">{qty} шт.</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Пока нет заказов за 30 дней.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
