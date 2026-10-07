"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Labels = { name: string; phone: string; message: string; send: string; required: string };

// No backend: opens WhatsApp with the message prefilled.
export default function ContactForm({ labels, waPrefix, waUrl }: { labels: Labels; waPrefix: string; waUrl: string }) {
  const [f, setF] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = { name: !f.name.trim(), message: !f.message.trim() };
    setErrors(missing);
    if (missing.name || missing.message) return;
    const text = [waPrefix, "", f.message.trim(), "", `— ${f.name.trim()}${f.phone ? `, ${f.phone}` : ""}`].join("\n");
    window.open(`${waUrl}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  const cls = (err?: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-blush-dark ${err ? "border-rose" : "border-line"}`;
  const field = (k: keyof typeof f, label: string, el: React.ReactNode) => (
    <div>
      <label htmlFor={`c-${k}`} className="mb-1.5 block text-xs text-muted">{label}</label>
      {el}
      {errors[k] && <p className="mt-1 text-xs text-rose">{labels.required}</p>}
    </div>
  );
  const bind = (k: keyof typeof f) => ({
    id: `c-${k}`,
    value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setF({ ...f, [k]: e.target.value });
      setErrors({ ...errors, [k]: false });
    },
  });

  return (
    <form onSubmit={submit} noValidate className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", labels.name, <input {...bind("name")} autoComplete="name" className={cls(errors.name)} />)}
        {field("phone", labels.phone, <input {...bind("phone")} type="tel" autoComplete="tel" className={cls()} />)}
      </div>
      {field("message", labels.message, <textarea {...bind("message")} rows={4} maxLength={1000} className={cls(errors.message)} />)}
      <Button type="submit" className="w-full sm:w-auto">{labels.send}</Button>
    </form>
  );
}
