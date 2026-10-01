import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-serif text-8xl text-blush md:text-9xl">404</p>
      <h1 className="mt-4 font-serif text-4xl">{t("title")}</h1>
      <p className="mt-3 text-muted">{t("text")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">{t("home")}</Button>
        <Button href="/catalog" variant="outline">
          {t("catalog")}
        </Button>
      </div>
    </div>
  );
}
