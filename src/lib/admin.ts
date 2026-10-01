export const STATUS = {
  new: { label: "В списке", cls: "bg-blush text-ink" },
  sold: { label: "Продано", cls: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "Отменён", cls: "bg-line text-muted line-through" },
} as const;

export type Status = keyof typeof STATUS;

export const fmtDate = (d: string) =>
  new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
