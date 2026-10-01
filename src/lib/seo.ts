import { routing } from "@/i18n/routing";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://akgul.kz").replace(/\/$/, "");

// Canonical + hreflang links for a locale-less path like "/catalog".
export function alternates(locale: string, path = "") {
  const p = path === "/" ? "" : path;
  return {
    canonical: `/${locale}${p}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${p}`])),
      "x-default": `/${routing.defaultLocale}${p}`,
    },
  };
}
