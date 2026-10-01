export const STATUS = {
  new: { label: "Новый", cls: "bg-blush text-ink" },
  preparing: { label: "Готовится", cls: "bg-amber-100 text-amber-900" },
  delivering: { label: "Доставляется", cls: "bg-sky-100 text-sky-900" },
  done: { label: "Готов", cls: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "Отменён", cls: "bg-line text-muted line-through" },
} as const;

export type Status = keyof typeof STATUS;

export const fmtDate = (d: string) =>
  new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
