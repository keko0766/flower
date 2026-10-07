import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/data";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Настройки" };

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-4xl">Настройки магазина</h1>
      <p className="mt-2 text-sm text-muted">Контакты, цены и время доставки. Изменения сразу появляются на сайте.</p>
      <SettingsForm
        initial={{
          phone: s.phone,
          whatsappPhone: s.whatsappPhone ?? "",
          telegram: s.telegram ?? "",
          instagram: s.instagram ?? "",
          email: s.email ?? "",
          hours: s.hours,
          deliveryPrice: s.deliveryPrice,
          freeDeliveryFrom: s.freeDeliveryFrom,
          giftPackagingPrice: s.giftPackagingPrice,
          ribbonPrice: s.ribbonPrice,
          slots: s.slots,
        }}
      />
    </div>
  );
}
