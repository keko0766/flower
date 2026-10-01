"use client";

import { useTranslations } from "next-intl";
import Chip from "@/components/ui/Chip";
import type { Option } from "@/lib/data";
import PriceRange from "./PriceRange";
import { useCatalogParams } from "./useCatalogParams";

export type FilterData = {
  occasions: Option[];
  colors: Option[];
  range: { min: number; max: number };
};

export default function Filters({ occasions, colors, range }: FilterData) {
  const t = useTranslations("catalog");
  const { get, set } = useCatalogParams();
  const occasion = get("occasion");
  const color = get("color");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xs uppercase tracking-[0.12em] text-muted">{t("price")}</h2>
        <PriceRange
          key={`${get("min")}-${get("max")}`}
          bounds={range}
          value={[Number(get("min")) || range.min, Number(get("max")) || range.max]}
          onCommit={([min, max]) =>
            set({
              min: min > range.min ? String(min) : undefined,
              max: max < range.max ? String(max) : undefined,
            })
          }
        />
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.12em] text-muted">{t("occasion")}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {occasions.map((o) => (
            <Chip
              key={o.slug}
              active={occasion === o.slug}
              onClick={() => set({ occasion: occasion === o.slug ? undefined : o.slug })}
            >
              {o.name}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.12em] text-muted">{t("color")}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {colors.map((c) => {
            const active = color === c.slug;
            return (
              <button
                key={c.slug}
                aria-pressed={active}
                onClick={() => set({ color: active ? undefined : c.slug })}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm transition-colors ${
                  active ? "border-ink bg-white" : "border-line bg-white hover:border-blush"
                }`}
              >
                <span
                  className="size-5 rounded-full border border-line"
                  style={{
                    background:
                      c.hex === "linear"
                        ? "conic-gradient(#C0392B, #F4C430, #E9A3B0, #F08A4B, #C0392B)"
                        : c.hex,
                  }}
                />
                {c.name}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
