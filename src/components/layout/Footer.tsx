import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { navItems } from "@/lib/nav";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-20 bg-ink text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="font-serif text-3xl text-white">{site.name}</p>
          <p className="mt-3 max-w-xs text-sm">{t("footer.tagline")}</p>
          <div className="mt-5 flex gap-4 text-sm">
            <a href={site.instagram} target="_blank" rel="noopener" className="hover:text-blush">Instagram</a>
            <a href={site.whatsapp} target="_blank" rel="noopener" className="hover:text-blush">WhatsApp</a>
            <a href={site.telegram} target="_blank" rel="noopener" className="hover:text-blush">Telegram</a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-white/50">{t("footer.navTitle")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-blush">{t(`nav.${item.key}`)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-white/50">{t("footer.legalTitle")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {(["privacy", "returns", "terms"] as const).map((k) => (
              <li key={k}>
                <Link href={`/${k}`} className="hover:text-blush">{t(`nav.${k}`)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-white/50">{t("footer.contactsTitle")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href={site.phoneHref} className="hover:text-blush">{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="hover:text-blush">{site.email}</a></li>
            <li>{t("footer.address")}</li>
            <li>{t("footer.hours")} {site.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © 2026 {site.name}. {t("footer.rights")}
      </div>
    </footer>
  );
}
