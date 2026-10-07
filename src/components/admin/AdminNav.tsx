"use client";

import { CalendarX, ExternalLink, Flower2, LayoutDashboard, LogOut, Package, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const items = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Заказы", icon: Package },
  { href: "/admin/bouquets", label: "Букеты", icon: Flower2 },
  { href: "/admin/dates", label: "Недоступные даты", icon: CalendarX },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 z-30 border-b border-line bg-white md:h-screen md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-4 py-3 md:block md:px-5 md:py-6">
        <Link href="/admin" className="font-serif text-2xl md:text-3xl">Ақ Гүл</Link>
        <p className="hidden truncate text-xs text-muted md:mt-1 md:block">{email}</p>
        <button onClick={logout} aria-label="Выйти" className="p-2 text-muted hover:text-rose md:hidden">
          <LogOut size={18} />
        </button>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2 text-sm md:flex-col md:px-3">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              isActive(href) ? "bg-blush/50 font-medium" : "hover:bg-cream"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="hidden space-y-1 px-3 pt-6 text-sm md:block">
        <a href="/ru" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted hover:bg-cream">
          <ExternalLink size={18} /> Открыть сайт
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted hover:bg-cream">
          <LogOut size={18} /> Выйти
        </button>
      </div>
    </aside>
  );
}
