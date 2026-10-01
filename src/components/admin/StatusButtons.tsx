"use client";

import { useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import { STATUS, type Status } from "@/lib/admin";

export default function StatusButtons({ id, status }: { id: string; status: Status }) {
  const [pending, start] = useTransition();

  return (
    <div className={`flex flex-wrap gap-2 ${pending ? "opacity-60" : ""}`}>
      {(Object.keys(STATUS) as Status[]).map((s) => (
        <button
          key={s}
          disabled={pending || s === status}
          onClick={() => start(() => setOrderStatus(id, s))}
          aria-pressed={s === status}
          className={`rounded-full px-4 py-2 text-sm transition ${
            s === status ? `${STATUS[s].cls} ring-2 ring-ink` : "bg-cream hover:bg-blush/50"
          }`}
        >
          {STATUS[s].label}
        </button>
      ))}
    </div>
  );
}
