import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Button from "@/components/ui/Button";
import { getContent } from "@/content/pages";

type Props = PageProps<"/[locale]/about">;

const PHOTOS = ["1519378058457-4c29a0a2efac", "1457089328109-e5d9bd499191"];
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getContent(locale).about;
  return {
    alternates: alternates(locale, "/about"),
    title: `${c.title} — Ақ Гүл`,
    description: c.metaDescription,
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = getContent(locale).about;
  const t = await getTranslations("ui");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <h1 className="font-serif text-5xl md:text-7xl">{c.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted md:text-xl">{c.lead}</p>

      <div className="mt-12 grid items-start gap-8 md:grid-cols-2 md:gap-14">
        <div className="grid grid-cols-2 gap-4">
          {PHOTOS.map((id, i) => (
            <div
              key={id}
              className={`relative aspect-[3/4] overflow-hidden rounded-[24px] ${i === 1 ? "mt-12" : ""}`}
            >
              <Image
                src={img(id)}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="space-y-5 leading-relaxed">
          {c.story.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {c.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[20px] bg-white p-6 text-center"
          >
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-serif text-4xl text-rose md:text-5xl">
              {s.value}
            </dd>
            <dd className="mt-1 text-sm text-muted">{s.label}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-20">
        <h2 className="font-serif text-3xl md:text-5xl">{c.teamTitle}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 md:gap-6">
          {c.team.map((m) => (
            <div
              key={m.name}
              className="rounded-[20px] bg-white p-6 text-center"
            >
              <span className="mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#f4d9da] via-blush to-[#cfd8c4] font-serif text-4xl">
                {m.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <p className="mt-4 font-serif text-2xl">{m.name}</p>
              <p className="mt-1 text-sm text-muted">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-[28px] bg-blush/40 p-6 md:p-12">
        <h2 className="font-serif text-3xl md:text-5xl">{c.valuesTitle}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {c.values.map((v, i) => (
            <div key={v.title}>
              <span className="font-serif text-5xl text-rose/60">0{i + 1}</span>
              <h3 className="mt-2 font-serif text-2xl">{v.title}</h3>
              <p className="mt-2 text-sm text-ink/80">{v.text}</p>
            </div>
          ))}
        </div>
        <Button href="/catalog" className="mt-10">
          {t("toCatalog")}
        </Button>
      </section>
    </div>
  );
}
