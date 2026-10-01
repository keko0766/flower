import { ChevronDown, Clock, CreditCard, QrCode, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import { getContent } from "@/content/pages";

type Props = PageProps<"/[locale]/delivery">;
const PAY_ICONS = [Wallet, QrCode, CreditCard];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getContent(locale).delivery;
  return {
    alternates: alternates(locale, "/delivery"),
    title: `${c.title} — Ақ Гүл`,
    description: c.metaDescription,
  };
}

export default async function DeliveryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = getContent(locale).delivery;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqLd).replace(/</g, "\\u003c"),
        }}
      />
      <h1 className="font-serif text-4xl md:text-6xl">{c.title}</h1>

      <section className="mt-10">
        <h2 className="font-serif text-3xl">{c.zonesTitle}</h2>
        <ul className="mt-5 divide-y divide-line rounded-[20px] bg-white">
          {c.zones.map((z) => (
            <li
              key={z.name}
              className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:p-6"
            >
              <div>
                <p className="font-medium">{z.name}</p>
                <p className="mt-0.5 text-sm text-muted">{z.note}</p>
              </div>
              <p className="shrink-0 font-semibold text-rose">{z.price}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 flex gap-4 rounded-[20px] bg-blush/40 p-5 md:p-6">
        <Clock className="mt-1 shrink-0 text-rose" size={22} />
        <div>
          <h2 className="font-serif text-2xl">{c.intervalsTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed">{c.intervals}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-3xl">{c.paymentTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {c.payments.map((p, i) => {
            const Icon = PAY_ICONS[i];
            return (
              <div key={p.title} className="rounded-[20px] bg-white p-5">
                <Icon className="text-rose" size={22} />
                <p className="mt-3 font-medium">{p.title}</p>
                <p className="mt-1 text-sm text-muted">{p.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-3xl md:text-4xl">{c.faqTitle}</h2>
        <div className="mt-5 space-y-3">
          {c.faq.map((f) => (
            <details
              key={f.q}
              className="group rounded-[16px] bg-white px-5 open:pb-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-muted transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="text-sm leading-relaxed text-ink/80">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
