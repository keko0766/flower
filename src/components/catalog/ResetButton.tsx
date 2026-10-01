"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useCatalogParams } from "./useCatalogParams";

export default function ResetButton({ className }: { className?: string }) {
  const t = useTranslations("catalog");
  const { reset } = useCatalogParams();
  return (
    <Button variant="outline" onClick={reset} className={className}>
      {t("reset")}
    </Button>
  );
}
