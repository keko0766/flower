"use client";

import { Copy } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { duplicateBouquet, setBouquetActive } from "@/app/admin/actions";

// Inline controls for the bouquets list: show/hide on the site and duplicate.
export default function BouquetRowActions({ id, name, active }: { id: string; name: string; active: boolean }) {
  const [pending, start] = useTransition();
  const [shown, setShown] = useOptimistic(active);

  return (
    <div className={`flex shrink-0 items-center gap-1 sm:gap-2 ${pending ? "opacity-60" : ""}`}>
      <button
        type="button"
        role="switch"
        aria-checked={shown}
        aria-label={`${name}: показывать на сайте`}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setShown(!shown);
            await setBouquetActive(id, !shown);
          })
        }
        className="flex items-center gap-2 rounded-full p-1.5 text-xs"
      >
        <span className={`relative h-6 w-10 rounded-full transition-colors ${shown ? "bg-emerald-600" : "bg-line"}`}>
          <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${shown ? "left-[18px]" : "left-0.5"}`} />
        </span>
        <span className={`hidden w-16 text-left sm:inline ${shown ? "text-emerald-900" : "text-muted"}`}>{shown ? "На сайте" : "Скрыт"}</span>
      </button>
      <button
        type="button"
        title="Сделать копию"
        aria-label={`Сделать копию «${name}»`}
        disabled={pending}
        onClick={() => start(() => duplicateBouquet(id))}
        className="rounded-full p-2 text-muted hover:bg-cream hover:text-ink"
      >
        <Copy size={16} />
      </button>
    </div>
  );
}
