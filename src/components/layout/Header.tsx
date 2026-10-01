"use client";

import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { navItems } from "@/lib/nav";
import CartBadge from "@/components/cart/CartBadge";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-20">
          <button
            className="-ml-2 p-2 md:hidden"
            aria-label={t("menu")}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>

          <Link
            href="/"
            className="font-serif text-3xl leading-none tracking-wide"
          >
            Ақ Гүл
          </Link>

          <nav className="hidden gap-8 text-sm md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-rose ${
                  pathname.startsWith(item.href) ? "text-rose" : ""
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <Link
              href="/catalog#search"
              aria-label={t("search")}
              className="p-2 hover:text-rose"
            >
              <Search size={20} />
            </Link>
            <Link
              href="/cart"
              aria-label={t("cart")}
              className="relative -mr-2 p-2 hover:text-rose"
            >
              <ShoppingBag size={20} />
              <CartBadge />
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-cream px-4 md:hidden">
          <div className="flex h-16 items-center justify-between">
            <span className="font-serif text-3xl">Ақ Гүл</span>
            <button
              className="-mr-2 p-2"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
            >
              <X size={22} />
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-serif text-3xl"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-10">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </>
  );
}
