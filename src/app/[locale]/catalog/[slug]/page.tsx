import { Camera, Clock, Leaf, Star } from "lucide-react";
import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cache } from "react";
import AddToCart from "@/components/product/AddToCart";
import Gallery from "@/components/product/Gallery";
import ProductCard from "@/components/ui/ProductCard";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getBouquet, getBouquets, getOccasions, getSimilar } from "@/lib/data";
import { formatPrice } from "@/lib/format";

const load = cache((locale: Locale, slug: string) => getBouquet(locale, slug));

type Props = PageProps<"/[locale]/catalog/[slug]">;

export const revalidate = 300;

export async function generateStaticParams() {
  const bouquets = await getBouquets("ru");
  return bouquets.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const b = await load(locale, slug);
  if (!b) return {};
  const title = `${b.name} — ${formatPrice(b.price)} | Ақ Гүл`;
  return {
    alternates: alternates(locale, `/catalog/${slug}`),
    title,
    description: b.short,
    openGraph: { title, description: b.short, images: b.images.slice(0, 1) },
  };
}

export default async function BouquetPage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const b = await load(locale, slug);
  if (!b) notFound();

  const [t, tNav, similar, occasions] = await Promise.all([
    getTranslations("product"),
    getTranslations("nav"),
    getSimilar(locale, b),
    getOccasions(locale),
  ]);
  const tags = occasions.filter((o) => b.occasions.includes(o.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: b.name,
    description: b.short,
    image: b.images,
    sku: b.slug,
    brand: { "@type": "Brand", name: "Ақ Гүл" },
    ...(b.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: b.rating,
        reviewCount: b.popularity,
      },
    }),
    offers: {
      "@type": "Offer",
      price: b.price,
      priceCurrency: "KZT",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav className="text-xs text-muted md:text-sm">
        <Link href="/" className="hover:text-rose">
          {t("home")}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-rose">
          {tNav("catalog")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{b.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <Gallery images={b.images} name={b.name} />

        <div>
          <h1 className="font-serif text-4xl md:text-5xl">{b.name}</h1>

          {b.rating && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="flex text-rose" role="img" aria-label={`${b.rating} / 5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i <= Math.round(b.rating!) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-muted">
                {b.rating.toFixed(1)} · {t("reviews", { count: b.popularity })}
              </span>
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold">
              {formatPrice(b.price)}
            </span>
            {b.oldPrice && (
              <span className="text-lg text-muted line-through">
                {formatPrice(b.oldPrice)}
              </span>
            )}
          </div>
          <p className="mt-4 text-muted">{b.short}</p>

          <AddToCart id={b.id} />

          <ul className="mt-8 space-y-3 rounded-[20px] bg-white p-5 text-sm">
            <li className="flex items-center gap-3">
              <Camera size={18} className="text-rose" />
              {t("trustPhoto")}
            </li>
            <li className="flex items-center gap-3">
              <Clock size={18} className="text-rose" />
              {t("trustDelivery")}
            </li>
            <li className="flex items-center gap-3">
              <Leaf size={18} className="text-rose" />
              {t("trustFresh")}
            </li>
          </ul>

          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">
                {t("composition")}
              </dt>
              <dd className="mt-2">{b.composition}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">
                {t("size")}
              </dt>
              <dd className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="rounded-full bg-blush px-3 py-0.5 font-medium">
                  {b.size}
                </span>
                {b.heightCm && (
                  <span>
                    {t("height")}: {b.heightCm} {t("cm")}
                  </span>
                )}
                {b.diameterCm && (
                  <span>
                    {t("diameter")}: {b.diameterCm} {t("cm")}
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-muted">
                {t("description")}
              </dt>
              <dd className="mt-2 leading-relaxed">{b.description}</dd>
            </div>
            {tags.length > 0 && (
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-muted">
                  {t("occasions")}
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {tags.map((o) => (
                    <Link
                      key={o.slug}
                      href={{
                        pathname: "/catalog",
                        query: { occasion: o.slug },
                      }}
                      className="rounded-full border border-line bg-white px-4 py-1.5 transition-colors hover:border-blush"
                    >
                      {o.name}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl md:text-4xl">{t("similar")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {similar.map((s) => (
            <ProductCard
              key={s.id}
              id={s.id}
              name={s.name}
              description={s.short}
              price={s.price}
              oldPrice={s.oldPrice}
              image={s.images[0]}
              href={`/catalog/${s.slug}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
