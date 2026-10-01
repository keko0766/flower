"use client";

import { X } from "lucide-react";
import { useState, useTransition } from "react";
import { addBlockedDate, removeBlockedDate } from "@/app/admin/actions";

type Row = { day: string; note: string | null };

export default function BlockedDates({ dates }: { dates: Row[] }) {
  const [day, setDay] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await addBlockedDate(day, note);
      setError(res.error ?? "");
      if (!res.error) {
        setDay("");
        setNote("");
      }
    });
  }

  const cls = "rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-blush-dark";
  return (
    <>
      <form onSubmit={add} className="mt-6 flex flex-wrap gap-3 rounded-[20px] bg-white p-5">
        <input type="date" required value={day} onChange={(e) => setDay(e.target.value)} className={cls} aria-label="Дата" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Причина (необязательно)" className={`${cls} min-w-0 flex-1`} />
        <button disabled={pending} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-rose disabled:opacity-60">
          Добавить
        </button>
        {error && <p className="w-full text-sm text-rose">{error}</p>}
      </form>

      <ul className={`mt-4 divide-y divide-line rounded-[20px] bg-white ${pending ? "opacity-60" : ""}`}>
        {dates.map((d) => (
          <li key={d.day} className="flex items-center gap-4 px-5 py-3">
            <span className="font-medium">
              {new Date(`${d.day}T12:00:00Z`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", weekday: "short", timeZone: "UTC" })}
            </span>
            <span className="flex-1 text-sm text-muted">{d.note}</span>
            <button onClick={() => start(() => removeBlockedDate(d.day))} aria-label="Убрать дату" className="p-2 text-muted hover:text-rose">
              <X size={16} />
            </button>
          </li>
        ))}
        {!dates.length && <li className="px-5 py-6 text-center text-sm text-muted">Нет недоступных дат</li>}
      </ul>
    </>
  );
}
