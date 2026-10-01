import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getBouquets } from "@/lib/data";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

const STATIC = ["", "/catalog", "/about", "/delivery", "/contacts", "/privacy", "/returns", "/terms"];

function entry(path: string, extra: Partial<MetadataRoute.Sitemap[number]> = {}) {
  return routing.locales.map((locale) => ({
    url: `${siteUrl}/${locale}${path}`,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
    },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bouquets = await getBouquets("ru");
  return [
    ...STATIC.flatMap((p) =>
      entry(p, { changeFrequency: p === "" || p === "/catalog" ? "daily" : "monthly", priority: p === "" ? 1 : 0.6 }),
    ),
    ...bouquets.flatMap((b) =>
      entry(`/catalog/${b.slug}`, { changeFrequency: "weekly", priority: 0.8, images: b.images.slice(0, 1) }),
    ),
  ];
}
