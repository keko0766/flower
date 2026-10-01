import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import Filters from "@/components/catalog/Filters";
import ResetButton from "@/components/catalog/ResetButton";
import ProductCard from "@/components/ui/ProductCard";
import type { Locale } from "@/i18n/routing";
import {
  type Sort,
  getBouquets,
  getColors,
  getOccasions,
  getPriceRange,
} from "@/lib/data";

const SORTS: Sort[] = ["popular", "new", "cheap", "expensive"];

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/catalog">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return {
    alternates: alternates(locale, "/catalog"),
    title: `${t("title")} — Ақ Гүл`,
    description: t("metaDescription"),
  };
}

const str = (v: string | string[] | undefined) =>
  typeof v === "string" ? v : undefined;
const num = (v: string | string[] | undefined) => {
  const n = Number(str(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export default async function CatalogPage({
  params,
  searchParams,
}: PageProps<"/[locale]/catalog">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const sp = await searchParams;

  const sortParam = str(sp.sort) as Sort | undefined;
  const filters = {
    q: str(sp.q)?.trim() || undefined,
    occasion: str(sp.occasion),
    color: str(sp.color),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    sort: sortParam && SORTS.includes(sortParam) ? sortParam : "popular",
  };

  const [t, bouquets, occasions, colors, range] = await Promise.all([
    getTranslations("catalog"),
    getBouquets(locale, filters),
    getOccasions(locale),
    getColors(locale),
    getPriceRange(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <h1 className="font-serif text-4xl md:text-5xl">{t("title")}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <Filters occasions={occasions} colors={colors} range={range} />
        </aside>

        <div>
          <CatalogToolbar
            count={bouquets.length}
            occasions={occasions}
            colors={colors}
            range={range}
          />

          {bouquets.length ? (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {bouquets.map((b, i) => (
                <ProductCard
                  key={b.id}
                  priority={i < 2}
                  id={b.id}
                  name={b.name}
                  description={b.short}
                  price={b.price}
                  oldPrice={b.oldPrice}
                  image={b.images[0]}
                  href={`/catalog/${b.slug}`}
                />
              ))}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <p className="font-serif text-3xl">{t("emptyTitle")}</p>
              <p className="mt-2 text-muted">{t("emptyText")}</p>
              <ResetButton className="mt-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
