import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BouquetRowActions from "@/components/admin/BouquetRowActions";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Букеты" };

export default async function BouquetsPage({ searchParams }: PageProps<"/admin/bouquets">) {
  const { supabase } = await requireAdmin();
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.replace(/[,()%*\\"]/g, " ").trim() : "";

  let query = supabase
    .from("bouquets")
    .select("id, slug, name_ru, price, old_price, images, is_active, popularity")
    .order("created_at", { ascending: false });
  if (search) query = query.or(`name_ru.ilike.*${search}*,name_kk.ilike.*${search}*,slug.ilike.*${search}*`);
  const { data: bouquets } = await query;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Букеты</h1>
        <Link href="/admin/bouquets/new" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-rose">
          <Plus size={16} /> Добавить букет
        </Link>
      </div>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={search}
          placeholder="Поиск по названию или адресу"
          className="w-full max-w-md rounded-full border border-line bg-white px-5 py-3 text-sm outline-none focus:border-blush-dark"
        />
      </form>

      <ul className="mt-6 divide-y divide-line rounded-[20px] bg-white">
        {(bouquets ?? []).map((b) => (
          <li key={b.id} className="flex items-center gap-2 pr-3 hover:bg-cream/60 sm:gap-4 sm:pr-4">
            <Link href={`/admin/bouquets/${b.id}`} className={`flex min-w-0 flex-1 items-center gap-4 p-4 ${b.is_active ? "" : "opacity-60"}`}>
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-blush">
                {b.images[0] && <Image src={b.images[0]} alt="" fill sizes="56px" className="object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{b.name_ru}</span>
                <span className="block text-sm">
                  {formatPrice(b.price)}
                  {b.old_price && <span className="ml-2 text-xs text-muted line-through">{formatPrice(b.old_price)}</span>}
                </span>
              </span>
            </Link>
            <BouquetRowActions id={b.id} name={b.name_ru} active={b.is_active} />
          </li>
        ))}
      </ul>
      {!bouquets?.length && <p className="mt-6 text-center text-muted">Ничего не найдено</p>}
    </div>
  );
}
