// Brand name is fixed. Everything the owner can change (contacts, prices, slots)
// lives in the shop_settings table and is edited in the admin panel.
export const site = { name: "Ақ Гүл" };

export type Settings = {
  phone: string;
  whatsappPhone: string | null;
  telegram: string | null;
  instagram: string | null;
  email: string | null;
  hours: string;
  deliveryPrice: number;
  freeDeliveryFrom: number;
  giftPackagingPrice: number;
  ribbonPrice: number;
  slots: string[];
};

// "+7 (700) 123-45-67" / "8 700 123 45 67" → "77001234567"
export function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return d.length === 11 && d.startsWith("8") ? `7${d.slice(1)}` : d;
}

export const phoneHref = (s: Settings) => `tel:+${normalizePhone(s.phone)}`;
const waNumber = (s: Settings) => normalizePhone(s.whatsappPhone || s.phone);
export const whatsappUrl = (s: Settings, text?: string) =>
  `https://wa.me/${waNumber(s)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
