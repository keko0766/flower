import {
  CalendarClock,
  CircleCheck,
  Mail,
  Phone,
  Send,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import WhatsAppRedirect from "@/components/checkout/WhatsAppRedirect";
import Button from "@/components/ui/Button";
import { getOrderSummary } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout/success">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "success" });
  return { title: `${t("title")} — Ақ Гүл`, robots: { index: false } };
}

export default async function SuccessPage({
  params,
  searchParams,
}: PageProps<"/[locale]/checkout/success">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { order } = await searchParams;
  const [t, tFooter, summary] = await Promise.all([
    getTranslations("success"),
    getTranslations("footer"),
    typeof order === "string" ? getOrderSummary(order) : null,
  ]);

  if (!summary) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-serif text-4xl">{t("notFound")}</p>
        <Button href="/catalog" className="mt-8">
          {t("catalog")}
        </Button>
      </div>
    );
  }

  const date = new Date(
    `${summary.delivery_date}T12:00:00Z`,
  ).toLocaleDateString(locale === "kk" ? "kk-KZ" : "ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
    timeZone: "UTC",
  });
  const slot = summary.delivery_slot.replace("-", "–");
  const isPickup = summary.delivery_method === "pickup";

  const waLines = [
    `${t("waGreeting")} №${summary.number}`,
    "",
    ...summary.items.map(
      (i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`,
    ),
    "",
    `${t("waDate")}: ${date}, ${slot}`,
    isPickup ? t("waPickup") : `${t("waAddress")}: ${summary.address}`,
    `${t("waTotal")}: ${formatPrice(summary.total)}`,
  ];
  const waUrl = `https://wa.me/${site.whatsappPhone}?text=${encodeURIComponent(waLines.join("\n"))}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <div className="text-center">
        <CircleCheck
          size={56}
          className="mx-auto text-sage"
          strokeWidth={1.5}
        />
        <h1 className="mt-6 font-serif text-4xl md:text-5xl">{t("title")}</h1>
        <p className="mt-3 text-lg font-medium">
          {t("number", { number: summary.number })}
        </p>
        <p className="mt-2 text-muted">{t("text")}</p>
      </div>

      <WhatsAppRedirect url={waUrl} />

      <div className="mt-6 space-y-4">
        <Card icon={<CalendarClock size={20} />} title={t("whenWhere")}>
          <p className="first-letter:uppercase">
            {t("deliveryLine", { date, slot })}
          </p>
          {isPickup ? (
            <p className="mt-1 text-muted">
              {t("pickupLine", {
                address: tFooter("address"),
                time: slot.split("–")[0],
              })}
            </p>
          ) : (
            <p className="mt-1 text-muted">{summary.address}</p>
          )}
          <p className="mt-1 text-muted">
            {t("recipient", { name: summary.recipient_name })}
          </p>
        </Card>

        <Card icon={<Wallet size={20} />} title={t("paymentTitle")}>
          <p>
            {summary.payment_method === "cash"
              ? t("paymentCash")
              : t("paymentOnline")}
          </p>
        </Card>

        <section className="rounded-[20px] bg-white p-5 md:p-6">
          <h2 className="font-serif text-2xl">{t("details")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {summary.items.map((i, n) => (
              <li key={n} className="flex justify-between gap-4">
                <span>
                  {i.name} <span className="text-muted">× {i.qty}</span>
                </span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
            {summary.card_enabled && (
              <li className="text-muted">+ {t("card")}</li>
            )}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <Row label={t("items")} value={formatPrice(summary.items_total)} />
            <Row
              label={t("packaging")}
              value={
                summary.packaging_price
                  ? formatPrice(summary.packaging_price)
                  : t("free")
              }
            />
            <Row
              label={t("delivery")}
              value={
                summary.delivery_price
                  ? formatPrice(summary.delivery_price)
                  : t("free")
              }
            />
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
              <dt>{t("total")}</dt>
              <dd>{formatPrice(summary.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[20px] bg-ink p-5 text-white/80 md:p-6">
          <h2 className="font-serif text-2xl text-white">
            {t("contactsTitle")}
          </h2>
          <p className="mt-1 text-sm">
            {t("contactsText", { hours: site.hours })}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <a
              href={site.phoneHref}
              className="flex items-center gap-2 hover:text-blush"
            >
              <Phone size={16} />
              {site.phone}
            </a>
            <a
              href={site.telegram}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 hover:text-blush"
            >
              <Send size={16} />
              Telegram
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-2 hover:text-blush"
            >
              <Mail size={16} />
              {site.email}
            </a>
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">{t("home")}</Button>
        <Button href="/catalog" variant="outline">
          {t("catalog")}
        </Button>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex gap-4 rounded-[20px] bg-white p-5 text-sm md:p-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream text-rose">
        {icon}
      </span>
      <div>
        <h2 className="mb-1 text-xs uppercase tracking-[0.12em] text-muted">
          {title}
        </h2>
        {children}
      </div>
    </section>
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
