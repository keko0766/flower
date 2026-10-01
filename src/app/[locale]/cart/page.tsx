import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CartView from "@/components/cart/CartView";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return {
    title: `${t("title")} — Ақ Гүл`,
    description: t("metaDescription"),
    robots: { index: false },
  };
}

export default async function CartPage({
  params,
}: PageProps<"/[locale]/cart">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <h1 className="font-serif text-4xl md:text-5xl">{t("title")}</h1>
      <CartView />
    </div>
  );
}
