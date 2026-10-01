import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getBouquetsByIds } from "@/lib/data";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fresh names and prices for the ids stored in the visitor's cart.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const locale = params.get("locale");
  const ids = (params.get("ids") ?? "").split(",").filter((id) => UUID.test(id)).slice(0, 50);

  if (!hasLocale(routing.locales, locale)) {
    return Response.json({ error: "bad locale" }, { status: 400 });
  }
  return Response.json(await getBouquetsByIds(locale, ids));
}
