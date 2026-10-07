"use client";

import { ArrowLeft, ArrowRight, ChevronDown, ImagePlus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState, useTransition } from "react";
import { type BouquetInput, deleteBouquet, saveBouquet } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";

type Option = { slug: string; name_ru: string };
type Props = { id: string | null; initial?: BouquetInput; occasions: Option[]; colors: Option[] };

const empty: BouquetInput = {
  slug: "", name_ru: "", name_kk: "", short_ru: "", short_kk: "",
  description_ru: "", description_kk: "", composition_ru: "", composition_kk: "",
  price: 0, old_price: null, size: "M", height_cm: null, diameter_cm: null,
  images: [], is_active: true, occasions: [], colors: [],
};

const MAX_MB = 5;

// Open the "Дополнительно" block when editing a bouquet that already has something in it.
const hasExtras = (b: BouquetInput) =>
  !!(b.old_price || b.height_cm || b.diameter_cm || b.short_ru || b.composition_ru || b.description_ru);

export default function BouquetForm({ id, initial = empty, occasions, colors }: Props) {
  const [f, setF] = useState<BouquetInput>(initial);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof BouquetInput>(k: K, v: BouquetInput[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: "occasions" | "colors", slug: string) =>
    set(k, f[k].includes(slug) ? f[k].filter((s) => s !== slug) : [...f[k], slug]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const supabase = createClient();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || file.size > MAX_MB * 1024 * 1024) {
        setError(`«${file.name}»: нужен файл-изображение до ${MAX_MB} МБ`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${f.slug || "bouquet"}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("bouquets").upload(path, file, { contentType: file.type });
      if (error) {
        setError(`Не удалось загрузить «${file.name}»: ${error.message}`);
        continue;
      }
      urls.push(supabase.storage.from("bouquets").getPublicUrl(path).data.publicUrl);
    }
    setF((p) => ({ ...p, images: [...p.images, ...urls] }));
    setUploading(false);
  }

  const move = (i: number, d: -1 | 1) => {
    const imgs = [...f.images];
    [imgs[i], imgs[i + d]] = [imgs[i + d], imgs[i]];
    set("images", imgs);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveBouquet(id, f);
      if (res?.error) setError(res.error);
    });
  }

  function remove() {
    if (!id || !confirm(`Удалить букет «${f.name_ru}»? Это действие нельзя отменить.`)) return;
    start(() => deleteBouquet(id));
  }

  const text = (k: keyof BouquetInput, label: string, area = false) => (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      {area ? (
        <textarea value={f[k] as string} rows={4} onChange={(e) => set(k, e.target.value as never)} className={cls} />
      ) : (
        <input value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} className={cls} />
      )}
    </label>
  );
  const num = (k: "price" | "old_price" | "height_cm" | "diameter_cm", label: string) => (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      <input
        type="number"
        min={0}
        value={f[k] || ""}
        onChange={(e) => set(k, (e.target.value === "" ? (k === "price" ? 0 : null) : Number(e.target.value)) as never)}
        className={cls}
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="mt-6 space-y-5 pb-24">
      <Box title="Основное">
        {text("name_ru", "Название *")}
        <div className="grid gap-4 sm:grid-cols-2">{num("price", "Цена, ₸ *")}</div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} className="size-4 accent-[var(--color-ink)]" />
          Показывать на сайте
        </label>
      </Box>

      <Box title="Фото *">
        <div className="flex flex-wrap gap-3">
          {f.images.map((src, i) => (
            <div key={src} className="group relative size-28 overflow-hidden rounded-xl bg-blush">
              <Image src={src} alt="" fill sizes="112px" className="object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-ink px-2 py-0.5 text-[10px] text-white">главное</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/60 p-1 text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Левее" className="p-1 disabled:opacity-30"><ArrowLeft size={14} /></button>
                <button type="button" onClick={() => set("images", f.images.filter((x) => x !== src))} aria-label="Убрать фото" className="p-1"><X size={14} /></button>
                <button type="button" disabled={i === f.images.length - 1} onClick={() => move(i, 1)} aria-label="Правее" className="p-1 disabled:opacity-30"><ArrowRight size={14} /></button>
              </div>
            </div>
          ))}
          <label className={`flex size-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs text-muted hover:border-blush-dark ${uploading ? "opacity-50" : ""}`}>
            <ImagePlus size={22} />
            {uploading ? "Загрузка…" : "Добавить"}
            <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} className="sr-only" />
          </label>
        </div>
        <p className="text-xs text-muted">JPG/PNG/WebP до {MAX_MB} МБ. Первое фото — главное в каталоге.</p>
      </Box>

      <Box title="Поводы и цвета">
        <Chips options={occasions} selected={f.occasions} onToggle={(s) => toggle("occasions", s)} />
        <Chips options={colors} selected={f.colors} onToggle={(s) => toggle("colors", s)} />
        <p className="text-xs text-muted">Помогают покупателям находить букет через фильтры в каталоге.</p>
      </Box>

      <details open={hasExtras(initial)} className="group rounded-[20px] bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between p-5 md:p-6 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="font-serif text-2xl">Дополнительно</span>
            <span className="mt-1 block text-xs text-muted">Описание, размер, старая цена, текст на казахском. Можно не заполнять.</span>
          </span>
          <ChevronDown size={20} className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-5 border-t border-line p-5 md:p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {num("old_price", "Старая цена, ₸")}
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted">Размер</span>
              <select value={f.size} onChange={(e) => set("size", e.target.value as BouquetInput["size"])} className={cls}>
                {["S", "M", "L", "XL"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            {num("height_cm", "Высота, см")}
            {num("diameter_cm", "Диаметр, см")}
          </div>
          {text("short_ru", "Короткое описание")}
          {text("composition_ru", "Состав")}
          {text("description_ru", "Подробное описание", true)}

          <div className="space-y-4 rounded-xl bg-cream/60 p-4">
            <p className="text-sm font-medium">Қазақша <span className="font-normal text-muted">— необязательно</span></p>
            <p className="text-xs text-muted">Если оставить пустым, на казахской версии сайта покажется русский текст.</p>
            {text("name_kk", "Название (қаз)")}
            {text("short_kk", "Короткое описание (қаз)")}
            {text("composition_kk", "Состав (қаз)")}
            {text("description_kk", "Подробное описание (қаз)", true)}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">Адрес страницы</span>
            <div className="flex items-center rounded-xl border border-line bg-white pl-4 text-sm focus-within:border-blush-dark">
              <span className="text-muted">/catalog/</span>
              <input value={f.slug} onChange={(e) => set("slug", e.target.value)} className="w-full rounded-xl px-1 py-3 outline-none" placeholder="создастся автоматически из названия" />
            </div>
          </label>
        </div>
      </details>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur md:left-[220px]">
        <div className="flex max-w-4xl items-center gap-3 px-4 py-3 md:px-8">
          <button type="submit" disabled={pending || uploading} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-rose disabled:opacity-60">
            {pending ? "Сохраняем…" : "Сохранить"}
          </button>
          <Link href="/admin/bouquets" className="rounded-full px-4 py-3 text-sm text-muted hover:text-ink">Отмена</Link>
          {error && <p role="alert" className="flex-1 text-sm text-rose">{error}</p>}
          {id && (
            <button type="button" onClick={remove} disabled={pending} className="ml-auto flex items-center gap-2 rounded-full px-4 py-3 text-sm text-rose hover:bg-blush/40">
              <Trash2 size={16} /> <span className="hidden sm:inline">Удалить</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

const cls = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-blush-dark";

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-[20px] bg-white p-5 md:p-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Chips({ options, selected, onToggle }: { options: Option[]; selected: string[]; onToggle: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.slug}
          type="button"
          aria-pressed={selected.includes(o.slug)}
          onClick={() => onToggle(o.slug)}
          className={`rounded-full border px-4 py-2 text-sm ${selected.includes(o.slug) ? "border-blush bg-blush" : "border-line hover:border-blush"}`}
        >
          {o.name_ru}
        </button>
      ))}
    </div>
  );
}
