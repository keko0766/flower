"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Filters, { type FilterData } from "./Filters";
import { useCatalogParams } from "./useCatalogParams";

const SORTS = [
  ["popular", "sortPopular"],
  ["new", "sortNew"],
  ["cheap", "sortCheap"],
  ["expensive", "sortExpensive"],
] as const;

export default function CatalogToolbar({ count, ...filterData }: { count: number } & FilterData) {
  const t = useTranslations("catalog");
  const { get, set, reset, pending, activeCount } = useCatalogParams();
  const [query, setQuery] = useState(get("q"));
  const [sheet, setSheet] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the input in sync when the URL query is cleared elsewhere (reset buttons).
  const urlQ = get("q");
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    if (!urlQ) setQuery("");
  }

  // Debounced search.
  useEffect(() => {
    if (query === get("q")) return;
    const id = setTimeout(() => set({ q: query.trim() || undefined }), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Header search icon links to /catalog#search.
  useEffect(() => {
    if (window.location.hash === "#search") inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
  }, [sheet]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-blush"
          />
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => setSheet(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm lg:hidden"
          >
            <SlidersHorizontal size={16} />
            {t("filters")}
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-blush text-xs">
                {activeCount}
              </span>
            )}
          </button>

          <select
            aria-label={t("sort")}
            value={get("sort") || "popular"}
            onChange={(e) => set({ sort: e.target.value === "popular" ? undefined : e.target.value })}
            className="flex-1 cursor-pointer rounded-full border border-line bg-white px-5 py-3 text-sm outline-none md:flex-none"
          >
            {SORTS.map(([value, key]) => (
              <option key={value} value={value}>
                {t(key)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <h2 className={`text-sm font-normal ${pending ? "opacity-50" : ""}`}>{t("found", { count })}</h2>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="underline underline-offset-4 hover:text-rose"
          >
            {t("reset")}
          </button>
        )}
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-cream px-4 pb-6 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-serif text-2xl">{t("filters")}</p>
              <button aria-label="close" onClick={() => setSheet(false)} className="-mr-2 p-2">
                <X size={22} />
              </button>
            </div>
            <Filters {...filterData} />
            <div className="sticky bottom-0 mt-8 flex gap-3 bg-cream pt-2">
              <Button variant="outline" className="flex-1" onClick={reset}>
                {t("reset")}
              </Button>
              <Button className="flex-1" onClick={() => setSheet(false)}>
                {t("show")} ({count})
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
