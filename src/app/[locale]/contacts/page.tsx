import { Camera, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import ContactForm from "@/components/ContactForm";
import { getContent } from "@/content/pages";
import { site } from "@/lib/site";

type Props = PageProps<"/[locale]/contacts">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getContent(locale).contacts;
  return {
    alternates: alternates(locale, "/contacts"),
    title: `${c.title} — Ақ Гүл`,
    description: c.metaDescription,
  };
}

const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent("Алматы, проспект Абая 52")}&z=16&output=embed`;

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = getContent(locale).contacts;
  const tFooter = await getTranslations("footer");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <h1 className="font-serif text-4xl md:text-6xl">{c.title}</h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="space-y-5 rounded-[20px] bg-white p-6">
            <Item icon={<MapPin size={18} />} label={c.address}>
              <p>{tFooter("address")}</p>
              <p className="text-sm text-muted">{c.addressHint}</p>
            </Item>
            <Item icon={<Phone size={18} />} label="Телефон">
              <a href={site.phoneHref} className="hover:text-rose">
                {site.phone}
              </a>
            </Item>
            <Item icon={<Mail size={18} />} label="Email">
              <a href={`mailto:${site.email}`} className="hover:text-rose">
                {site.email}
              </a>
            </Item>
            <div className="flex flex-wrap gap-2 pt-1">
              <Social
                href={site.whatsapp}
                icon={<MessageCircle size={16} />}
                className="bg-whatsapp text-white"
              >
                WhatsApp
              </Social>
              <Social
                href={site.telegram}
                icon={<Send size={16} />}
                className="bg-telegram text-white"
              >
                Telegram
              </Social>
              <Social
                href={site.instagram}
                icon={<Camera size={16} />}
                className="bg-ink text-white"
              >
                Instagram
              </Social>
            </div>
          </div>

          <div className="rounded-[20px] bg-white p-6">
            <h2 className="font-serif text-2xl">{c.hoursTitle}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {c.days.map((d) => (
                <div
                  key={d}
                  className="flex justify-between border-b border-dashed border-line pb-2 last:border-0"
                >
                  <dt>{d}</dt>
                  <dd className="text-muted">{site.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[20px] bg-white">
            <iframe
              src={MAP_SRC}
              title={tFooter("address")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-80 w-full border-0 md:h-96"
            />
          </div>
          <div className="rounded-[20px] bg-white p-6">
            <h2 className="font-serif text-2xl">{c.formTitle}</h2>
            <p className="mt-1 text-sm text-muted">{c.formText}</p>
            <ContactForm
              labels={{
                name: c.name,
                phone: c.phone,
                message: c.message,
                send: c.send,
                required: c.required,
              }}
              waPrefix={c.waPrefix}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Item({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream text-rose">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function Social({
  href,
  icon,
  className,
  children,
}: {
  href: string;
  icon: ReactNode;
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 ${className}`}
    >
      {icon}
      {children}
    </a>
  );
}
