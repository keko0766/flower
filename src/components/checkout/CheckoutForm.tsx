"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { type ReactNode, useState, useTransition } from "react";
import { placeOrder } from "@/app/[locale]/checkout/actions";
import CartView from "@/components/cart/CartView";
import { useCartItems } from "@/components/cart/useCartItems";
import Button from "@/components/ui/Button";
import { Link, useRouter } from "@/i18n/navigation";
import { cart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import DatePicker from "./DatePicker";

type Props = { minDate: string; maxDate: string; blocked: string[] };

const initial = {
  name: "",
  phone: "",
  email: "",
  recipientIsMe: true,
  recipientName: "",
  recipientPhone: "",
  method: "delivery" as "delivery" | "pickup",
  address: "",
  apartment: "",
  floor: "",
  entranceCode: "",
  date: "",
  slot: site.slots[1],
  card: false,
  cardText: "",
  cardFrom: "",
  cardTo: "",
  packaging: "standard" as "standard" | "gift",
  ribbon: false,
  payment: "cash" as "cash" | "online",
  comment: "",
  consent: false,
};
type Form = typeof initial;

// +7 (7XX) XXX-XX-XX
function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = "+7";
  if (p[0]) out += ` (${p[0]}`;
  if (p[0].length === 3) out += ")";
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}
const phoneOk = (v: string) => v.replace(/\D/g, "").length === 11;

export default function CheckoutForm({ minDate, maxDate, blocked }: Props) {
  const t = useTranslations("checkout");
  const tFooter = useTranslations("footer");
  const locale = useLocale();
  const router = useRouter();
  const { items, isEmpty, loading, subtotal } = useCartItems();
  const [f, setF] = useState<Form>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [serverError, setServerError] = useState("");
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  if (isEmpty) return <CartView />;

  const packagingPrice =
    (f.packaging === "gift" ? site.giftPackagingPrice : 0) + (f.ribbon ? site.ribbonPrice : 0);
  const deliveryPrice =
    f.method === "pickup" || subtotal >= site.freeDeliveryFrom ? 0 : site.deliveryPrice;
  const total = subtotal + packagingPrice + deliveryPrice;

  function validate() {
    const e: typeof errors = {};
    const req = (k: keyof Form) => {
      if (!String(f[k]).trim()) e[k] = t("errRequired");
    };
    req("name");
    if (!phoneOk(f.phone)) e.phone = t("errPhone");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = t("errEmail");
    if (!f.recipientIsMe) {
      req("recipientName");
      if (!phoneOk(f.recipientPhone)) e.recipientPhone = t("errPhone");
    }
    if (f.method === "delivery") req("address");
    if (!f.date) e.date = t("errDate");
    if (!f.consent) e.consent = t("errConsent");
    return e;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    startTransition(async () => {
      const res = await placeOrder({
        locale,
        customer_name: f.name,
        customer_phone: f.phone,
        customer_email: f.email,
        recipient_name: f.recipientIsMe ? f.name : f.recipientName,
        recipient_phone: f.recipientIsMe ? f.phone : f.recipientPhone,
        delivery_method: f.method,
        address: f.address,
        apartment: f.apartment,
        floor: f.floor,
        entrance_code: f.entranceCode,
        delivery_date: f.date,
        delivery_slot: f.slot,
        card_enabled: f.card,
        card_text: f.cardText,
        card_from: f.cardFrom,
        card_to: f.cardTo,
        packaging: f.packaging,
        ribbon: f.ribbon,
        payment_method: f.payment,
        comment: f.comment,
        consent: f.consent,
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
      });
      if (res.ok) {
        cart.clear();
        router.replace(`/checkout/success?order=${res.id}`);
      } else {
        setServerError(t.has(`err${res.error}`) ? t(`err${res.error}`) : t("errServer"));
      }
    });
  }

  const input = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field id={k} label={label} error={errors[k]}>
      <input
        id={`f-${k}`}
        value={f[k] as string}
        onChange={(e) =>
          set(k, (props.type === "tel" ? formatPhone(e.target.value) : e.target.value) as never)
        }
        aria-invalid={!!errors[k]}
        className={inputCls(!!errors[k])}
        {...props}
      />
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Section title={t("you")}>
          {input("name", t("name"), { autoComplete: "name" })}
          <div className="grid gap-4 sm:grid-cols-2">
            {input("phone", t("phone"), { type: "tel", autoComplete: "tel", placeholder: "+7 (7__) ___-__-__" })}
            {input("email", t("email"), { type: "email", autoComplete: "email" })}
          </div>
        </Section>

        <Section title={t("recipient")}>
          <Check checked={f.recipientIsMe} onChange={(v) => set("recipientIsMe", v)}>{t("recipientIsMe")}</Check>
          {!f.recipientIsMe && (
            <div className="grid gap-4 sm:grid-cols-2">
              {input("recipientName", t("recipientName"))}
              {input("recipientPhone", t("recipientPhone"), { type: "tel", placeholder: "+7 (7__) ___-__-__" })}
            </div>
          )}
        </Section>

        <Section title={t("method")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Radio checked={f.method === "delivery"} onChange={() => set("method", "delivery")} title={t("delivery")}
              hint={t("deliveryHint", { price: formatPrice(site.deliveryPrice), free: formatPrice(site.freeDeliveryFrom) })} />
            <Radio checked={f.method === "pickup"} onChange={() => set("method", "pickup")} title={t("pickup")}
              hint={t("pickupHint", { address: tFooter("address") })} />
          </div>
          {f.method === "delivery" && (
            <>
              {input("address", t("street"), { autoComplete: "street-address" })}
              <div className="grid grid-cols-3 gap-4">
                {input("apartment", t("apartment"))}
                {input("floor", t("floor"), { inputMode: "numeric" })}
                {input("entranceCode", t("entranceCode"))}
              </div>
            </>
          )}
        </Section>

        <Section title={t("when")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="date" label={t("date")} error={errors.date}>
              <div id="f-date">
                <DatePicker value={f.date} onChange={(d) => set("date", d)} minDate={minDate} maxDate={maxDate} blocked={blocked} />
              </div>
            </Field>
            <Field id="slot" label={t("slot")}>
              <div className="grid grid-cols-2 gap-2">
                {site.slots.map((s) => (
                  <button key={s} type="button" onClick={() => set("slot", s)} aria-pressed={f.slot === s}
                    className={`rounded-xl border px-3 py-3 text-sm transition-colors ${f.slot === s ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-blush"}`}>
                    {s.replace("-", "–")}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">{f.method === "delivery" ? t("slotHint") : t("pickupSlotHint")}</p>
            </Field>
          </div>
        </Section>

        <Section title={t("card")}>
          <Check checked={f.card} onChange={(v) => set("card", v)}>{t("addCard")}</Check>
          {f.card && (
            <>
              <Field id="cardText" label={t("cardText")}>
                <textarea id="f-cardText" value={f.cardText} maxLength={200} rows={3}
                  onChange={(e) => set("cardText", e.target.value)} className={inputCls(false)} />
                <p className="mt-1 text-right text-xs text-muted">{f.cardText.length}/200</p>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                {input("cardFrom", t("cardFrom"), { maxLength: 100 })}
                {input("cardTo", t("cardTo"), { maxLength: 100 })}
              </div>
            </>
          )}
        </Section>

        <Section title={t("packaging")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Radio checked={f.packaging === "standard"} onChange={() => set("packaging", "standard")}
              title={t("standard")} hint={t("standardHint")} price={t("free")} />
            <Radio checked={f.packaging === "gift"} onChange={() => set("packaging", "gift")}
              title={t("gift")} hint={t("giftHint")} price={`+${formatPrice(site.giftPackagingPrice)}`} />
          </div>
          <Check checked={f.ribbon} onChange={(v) => set("ribbon", v)}>
            {t("ribbon")} <span className="text-muted">+{formatPrice(site.ribbonPrice)}</span>
          </Check>
        </Section>

        <Section title={t("payment")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Radio checked={f.payment === "cash"} onChange={() => set("payment", "cash")} title={t("cash")} hint={t("cashHint")} />
            <Radio checked={false} disabled onChange={() => {}} title={t("online")} hint={t("onlineHint")} />
          </div>
          <Field id="comment" label={t("comment")}>
            <textarea id="f-comment" value={f.comment} maxLength={500} rows={2} placeholder={t("commentPlaceholder")}
              onChange={(e) => set("comment", e.target.value)} className={inputCls(false)} />
          </Field>
        </Section>
      </div>

      <aside className="h-fit space-y-5 rounded-[20px] bg-white p-5 md:p-6 lg:sticky lg:top-28">
        <p className="font-serif text-2xl">{t("summary")}</p>
        {loading ? null : (
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-blush">
                  {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <span className="flex-1">{i.name} <span className="text-muted">× {i.qty}</span></span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
        )}
        <dl className="space-y-2 border-t border-line pt-4 text-sm">
          <Row label={t("items")} value={formatPrice(subtotal)} />
          <Row label={t("packagingPrice")} value={packagingPrice ? formatPrice(packagingPrice) : t("free")} />
          <Row label={t("deliveryPrice")} value={deliveryPrice ? formatPrice(deliveryPrice) : t("free")} />
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
            <dt>{t("total")}</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <div id="f-consent">
          <Check checked={f.consent} onChange={(v) => set("consent", v)}>
            <span className="text-xs leading-relaxed">
              {t.rich("consent", {
                link: (c) => <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-rose">{c}</Link>,
              })}
            </span>
          </Check>
          {errors.consent && <p className="mt-1 text-xs text-rose">{errors.consent}</p>}
        </div>

        {serverError && <p role="alert" className="rounded-xl bg-blush/40 p-3 text-sm">{serverError}</p>}

        <Button type="submit" disabled={pending || loading} className="w-full disabled:opacity-60">
          {pending ? t("submitting") : t("submit")}
        </Button>
      </aside>
    </form>
  );
}

const inputCls = (err: boolean) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-blush-dark ${err ? "border-rose" : "border-line"}`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-[20px] bg-white p-5 md:p-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className="mb-1.5 block text-xs text-muted">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </div>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-ink)]" />
      <span>{children}</span>
    </label>
  );
}

function Radio({ checked, onChange, title, hint, price, disabled }: {
  checked: boolean; onChange: () => void; title: string; hint: string; price?: string; disabled?: boolean;
}) {
  return (
    <label className={`flex gap-3 rounded-xl border p-4 transition-colors ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${checked ? "border-ink" : "border-line hover:border-blush"}`}>
      <input type="radio" checked={checked} onChange={onChange} disabled={disabled}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-ink)]" />
      <span className="flex-1">
        <span className="flex justify-between gap-2 text-sm font-medium">{title}{price && <span className="font-normal text-muted">{price}</span>}</span>
        <span className="mt-0.5 block text-xs text-muted">{hint}</span>
      </span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
