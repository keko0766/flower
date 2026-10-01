import { Camera, Clock, Leaf, Mail, MapPin, Phone, Star } from "lucide-react";
import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/home/Hero";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getOccasions, getPopular } from "@/lib/data";
import { site } from "@/lib/site";

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const HERO = [
  "1533616688419-b7a585564566",
  "1591886960571-74d43a9d4166",
  "1572454591674-2739f30d8c40",
];
const ABOUT = "1563241527-3004b7be0ffd";
const BENEFIT_ICONS = [Leaf, Clock, Camera, Mail];

export const revalidate = 300;

type Props = PageProps<"/[locale]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    alternates: alternates(locale, "/"),
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [img(HERO[0], 1200)],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [t, tFooter, popular, occasions] = await Promise.all([
    getTranslations("home"),
    getTranslations("footer"),
    getPopular(locale),
    getOccasions(locale),
  ]);

  const slides = (t.raw("slides") as { title: string; text: string }[]).map(
    (s, i) => ({
      ...s,
      image: img(HERO[i]),
    }),
  );
  const benefits = t.raw("benefits") as { title: string; text: string }[];
  const reviews = t.raw("reviews") as {
    name: string;
    text: string;
    date: string;
  }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: site.name,
    image: img(HERO[0], 1200),
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "пр. Абая, 52",
      addressLocality: "Алматы",
      addressCountry: "KZ",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
    sameAs: [site.instagram, site.telegram],
    priceRange: "₸₸",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Hero slides={slides} cta={t("cta")} />

      <section className="mx-auto max-w-6xl px-4 pt-14 md:pt-20">
        <h2 className="text-center font-serif text-3xl md:text-4xl">
          {t("occasionsTitle")}
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {occasions.map((o) => (
            <Link
              key={o.slug}
              href={{ pathname: "/catalog", query: { occasion: o.slug } }}
              className="rounded-full border border-line bg-white px-5 py-2.5 text-sm transition-colors hover:border-blush hover:bg-blush"
            >
              {o.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 md:pt-24">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl md:text-5xl">
            {t("popularTitle")}
          </h2>
          <Link
            href="/catalog"
            className="shrink-0 text-sm underline underline-offset-4 hover:text-rose"
          >
            {t("seeAll")}
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {popular.map((b) => (
            <ProductCard
              key={b.id}
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
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl items-center gap-8 px-4 md:mt-24 md:grid-cols-2 md:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] md:aspect-square">
          <Image
            src={img(ABOUT, 1200)}
            alt={t("aboutTitle")}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-4xl md:text-5xl">{t("aboutTitle")}</h2>
          <p className="mt-5 leading-relaxed text-muted">{t("aboutText")}</p>
          <Button href="/about" variant="outline" className="mt-8">
            {t("aboutLink")}
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 md:pt-24">
        <h2 className="text-center font-serif text-3xl md:text-5xl">
          {t("benefitsTitle")}
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[i];
            return (
              <div
                key={b.title}
                className="rounded-[20px] bg-white p-5 text-center md:p-7"
              >
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blush/50 text-rose">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 font-serif text-xl md:text-2xl">
                  {b.title}
                </h3>
                <p className="mt-2 text-xs text-muted md:text-sm">{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pt-16 md:pt-24">
        <h2 className="px-4 text-center font-serif text-3xl md:text-5xl">
          {t("reviewsTitle")}
        </h2>
        <div className="mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-6 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="w-[85%] shrink-0 snap-center rounded-[20px] bg-white p-6 md:w-auto"
            >
              <div className="flex text-rose" role="img" aria-label="5 / 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed">
                «{r.text}»
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-sm">
                <span className="flex size-10 items-center justify-center rounded-full bg-blush font-serif text-lg">
                  {r.name[0]}
                </span>
                <span>
                  <span className="block font-medium">{r.name}</span>
                  <span className="text-xs text-muted">{r.date}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 md:pt-24">
        <div className="grid gap-8 rounded-[28px] bg-blush/40 p-6 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl">
              {t("contactsTitle")}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-whatsapp px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                WhatsApp
              </a>
              <a
                href={site.telegram}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-telegram px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Telegram
              </a>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose"
              >
                Instagram
              </a>
            </div>
          </div>
          <div className="space-y-5 text-sm">
            <Info icon={<MapPin size={18} />} label={t("addressLabel")}>
              {tFooter("address")}
            </Info>
            <Info icon={<Clock size={18} />} label={t("hoursLabel")}>
              {t("hoursValue", { hours: site.hours })}
            </Info>
            <Info icon={<Phone size={18} />} label={t("phoneLabel")}>
              <a href={site.phoneHref} className="hover:text-rose">
                {site.phone}
              </a>
            </Info>
          </div>
        </div>
      </section>
    </>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-rose">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
        <div className="mt-1 text-base">{children}</div>
      </div>
    </div>
  );
}
