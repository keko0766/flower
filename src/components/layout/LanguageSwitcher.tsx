"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels = { ru: "РУ", kk: "ҚАЗ" } as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-line text-xs">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          aria-current={l === locale ? "true" : undefined}
          className={`px-3 py-1.5 transition-colors ${
            l === locale ? "bg-ink text-white" : "hover:bg-white"
          }`}
        >
          {labels[l]}
        </Link>
      ))}
    </div>
  );
}
