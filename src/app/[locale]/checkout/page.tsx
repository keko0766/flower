import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getBlockedDates } from "@/lib/data";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: `${t("title")} — Ақ Гүл`, robots: { index: false } };
}

// Min/max dates depend on today, so render per request.
export const dynamic = "force-dynamic";

// Today in Almaty, shifted by `days`, as YYYY-MM-DD.
function almatyDate(days: number) {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Almaty",
  });
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function CheckoutPage({
  params,
}: PageProps<"/[locale]/checkout">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, blocked] = await Promise.all([
    getTranslations("checkout"),
    getBlockedDates(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <h1 className="font-serif text-4xl md:text-5xl">{t("title")}</h1>
      <CheckoutForm
        minDate={almatyDate(1)}
        maxDate={almatyDate(60)}
        blocked={blocked}
      />
    </div>
  );
}
