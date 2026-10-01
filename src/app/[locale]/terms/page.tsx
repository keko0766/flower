import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { getContent } from "@/content/pages";

type Props = PageProps<"/[locale]/terms">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = getContent(locale).terms;
  return {
    alternates: alternates(locale, "/terms"),
    title: `${c.title} — Ақ Гүл`,
    description: c.sections[0].p,
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage {...getContent(locale).terms} />;
}
