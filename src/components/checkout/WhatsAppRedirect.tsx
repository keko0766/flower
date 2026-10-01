"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const DELAY = 4;

// Opens WhatsApp with the prefilled order text after a short countdown.
export default function WhatsAppRedirect({ url }: { url: string }) {
  const t = useTranslations("success");
  const [left, setLeft] = useState(DELAY);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;
    if (left === 0) {
      window.location.href = url;
      return;
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left, cancelled, url]);

  return (
    <div className="mt-10 rounded-[20px] bg-white p-6">
      <a
        href={url}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-7 py-3.5 font-medium text-white transition-opacity hover:opacity-90"
      >
        <MessageCircle size={20} />
        {t("whatsapp")}
      </a>
      <p className="mt-4 text-sm text-muted">{t("redirectHint")}</p>
      {!cancelled && left > 0 && (
        <p className="mt-2 text-sm">
          {t("redirect", { s: left })}{" "}
          <button onClick={() => setCancelled(true)} className="text-rose underline underline-offset-4">
            {t("stay")}
          </button>
        </p>
      )}
    </div>
  );
}
