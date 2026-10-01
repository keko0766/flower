"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate: string;
  maxDate: string;
  blocked: string[];
};

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function DatePicker({ value, onChange, minDate, maxDate, blocked }: Props) {
  const t = useTranslations("checkout");
  const months = t("months").split(",");
  const weekdays = t("weekdays").split(",");
  const start = value || minDate;
  const [view, setView] = useState({ y: +start.slice(0, 4), m: +start.slice(5, 7) - 1 });

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday first
  const canPrev = iso(view.y, view.m, 1) > minDate;
  const canNext = iso(view.y, view.m, daysInMonth) < maxDate;
  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label={t("prevMonth")} className="rounded-full p-1.5 hover:bg-cream disabled:opacity-25">
          <ChevronLeft size={18} />
        </button>
        <span className="font-medium">{months[view.m]} {view.y}</span>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label={t("nextMonth")} className="rounded-full p-1.5 hover:bg-cream disabled:opacity-25">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {weekdays.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = iso(view.y, view.m, i + 1);
          const isBlocked = blocked.includes(day);
          const disabled = day < minDate || day > maxDate || isBlocked;
          const selected = day === value;
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onChange(day)}
              title={isBlocked ? t("unavailable") : undefined}
              aria-pressed={selected}
              className={`aspect-square rounded-full text-sm transition-colors ${
                selected
                  ? "bg-ink text-white"
                  : disabled
                    ? `text-muted/40 ${isBlocked ? "line-through" : ""}`
                    : "hover:bg-blush"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
