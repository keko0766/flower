import { routing } from "@/i18n/routing";

const FALLBACK = "https://akgul.kz";

// Tolerates values like "example.com;" or " https://example.com/ " from the hosting panel.
function normalizeSiteUrl(raw: string | undefined) {
  const value = (raw ?? "").trim().replace(/[;,'"\s]+$/g, "").replace(/^['"]+/, "");
  if (!value) return FALLBACK;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.origin;
  } catch {
    console.warn(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}", using ${FALLBACK}`);
    return FALLBACK;
  }
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

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
