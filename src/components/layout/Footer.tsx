import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/data";
import { phoneHref, site, whatsappUrl } from "@/lib/site";
import { navItems } from "@/lib/nav";

export default async function Footer() {
  const [t, s] = await Promise.all([getTranslations(), getSettings()]);

  return (
    <footer className="mt-20 bg-ink text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="font-serif text-3xl text-white">{site.name}</p>
          <p className="mt-3 max-w-xs text-sm">{t("footer.tagline")}</p>
          <div className="mt-5 flex gap-4 text-sm">
            {s.instagram && <a href={s.instagram} target="_blank" rel="noopener" className="hover:text-blush">Instagram</a>}
            <a href={whatsappUrl(s)} target="_blank" rel="noopener" className="hover:text-blush">WhatsApp</a>
            {s.telegram && <a href={s.telegram} target="_blank" rel="noopener" className="hover:text-blush">Telegram</a>}
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
            <li><a href={phoneHref(s)} className="hover:text-blush">{s.phone}</a></li>
            {s.email && <li><a href={`mailto:${s.email}`} className="hover:text-blush">{s.email}</a></li>}
            <li>{t("footer.address")}</li>
            <li>{t("footer.hours")} {s.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © 2026 {site.name}. {t("footer.rights")}
      </div>
    </footer>
  );
}
