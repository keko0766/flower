"use client";

import { Plus, X } from "lucide-react";
import { type ReactNode, useState, useTransition } from "react";
import { type SettingsInput, saveSettings } from "@/app/admin/actions";

const cls = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-blush-dark";

export default function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [f, setF] = useState<SettingsInput>(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof SettingsInput>(k: K, v: SettingsInput[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  const text = (k: "phone" | "whatsappPhone" | "telegram" | "instagram" | "email" | "hours", label: string, hint?: string, placeholder?: string) => (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      <input value={f[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} className={cls} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
  const price = (k: "deliveryPrice" | "freeDeliveryFrom" | "giftPackagingPrice" | "ribbonPrice", label: string, hint?: string) => (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      <input type="number" min={0} step={100} value={f[k]} onChange={(e) => set(k, Number(e.target.value))} className={cls} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );

  const setSlot = (i: number, part: 0 | 1, v: string) => {
    const [a, b] = f.slots[i].split("-");
    const next = [...f.slots];
    next[i] = part === 0 ? `${v}-${b}` : `${a}-${v}`;
    set("slots", next);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    start(async () => {
      const res = await saveSettings(f);
      if (res.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5 pb-24">
      <Box title="Контакты">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("phone", "Телефон *", undefined, "+7 (700) 000-00-00")}
          {text("whatsappPhone", "Номер WhatsApp", "Если пусто, используется основной телефон", "+7 700 000 00 00")}
          {text("telegram", "Telegram", "@имя или ссылка. Пусто — кнопки на сайте не будет", "@your_shop")}
          {text("instagram", "Instagram", "@имя или ссылка. Пусто — кнопки на сайте не будет", "@your_shop")}
          {text("email", "Email", "Необязательно")}
          {text("hours", "Часы работы *", undefined, "09:00–21:00")}
        </div>
      </Box>

      <Box title="Доставка и цены">
        <div className="grid gap-4 sm:grid-cols-2">
          {price("deliveryPrice", "Стоимость доставки, ₸")}
          {price("freeDeliveryFrom", "Бесплатная доставка от, ₸", "Покупатель видит прогресс до этой суммы в корзине")}
          {price("giftPackagingPrice", "Подарочная упаковка, ₸")}
          {price("ribbonPrice", "Лента, ₸")}
        </div>
      </Box>

      <Box title="Время доставки">
        <p className="text-xs text-muted">Интервалы, которые покупатель выбирает при заказе. От 1 до 8.</p>
        <ul className="space-y-2">
          {f.slots.map((slot, i) => {
            const [a, b] = slot.split("-");
            return (
              <li key={i} className="flex items-center gap-2">
                <input type="time" value={a} onChange={(e) => setSlot(i, 0, e.target.value)} aria-label="С" className={`${cls} max-w-36`} />
                <span className="text-muted">–</span>
                <input type="time" value={b} onChange={(e) => setSlot(i, 1, e.target.value)} aria-label="До" className={`${cls} max-w-36`} />
                <button
                  type="button"
                  disabled={f.slots.length <= 1}
                  onClick={() => set("slots", f.slots.filter((_, j) => j !== i))}
                  aria-label="Убрать интервал"
                  className="rounded-full p-2 text-muted hover:bg-cream hover:text-rose disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </li>
            );
          })}
        </ul>
        {f.slots.length < 8 && (
          <button
            type="button"
            onClick={() => set("slots", [...f.slots, "09:00-12:00"])}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-blush-dark"
          >
            <Plus size={14} /> Добавить интервал
          </button>
        )}
      </Box>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur md:left-[220px]">
        <div className="flex max-w-4xl items-center gap-3 px-4 py-3 md:px-8">
          <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-rose disabled:opacity-60">
            {pending ? "Сохраняем…" : "Сохранить"}
          </button>
          {saved && <p role="status" className="text-sm text-emerald-700">Сохранено. Сайт уже обновился.</p>}
          {error && <p role="alert" className="flex-1 text-sm text-rose">{error}</p>}
        </div>
      </div>
    </form>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-[20px] bg-white p-5 md:p-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      {children}
    </section>
  );
}
