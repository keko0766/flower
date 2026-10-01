"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import { STATUS, type Status } from "@/lib/admin";

// Inline status control for the orders table.
export default function QuickStatus({ id, number, status }: { id: string; number: number; status: Status }) {
  const [pending, start] = useTransition();
  const set = (s: Status) => start(() => setOrderStatus(id, s));

  if (status === "new") {
    return (
      <div className={`flex flex-wrap gap-2 ${pending ? "opacity-50" : ""}`}>
        <button
          disabled={pending}
          onClick={() => set("sold")}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Check size={14} /> Продано
        </button>
        <button
          disabled={pending}
          onClick={() => confirm(`Отменить заказ №${number}?`) && set("cancelled")}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-rose hover:text-rose"
        >
          <X size={14} /> Отменить
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${pending ? "opacity-50" : ""}`}>
      <span className={`rounded-full px-3 py-1 text-xs ${STATUS[status].cls}`}>{STATUS[status].label}</span>
      <button
        disabled={pending}
        onClick={() => set("new")}
        title="Вернуть в список"
        aria-label={`Вернуть заказ №${number} в список`}
        className="rounded-full p-1.5 text-muted hover:bg-cream hover:text-ink"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
