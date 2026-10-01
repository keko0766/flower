"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

// Swipeable on touch (scroll-snap), thumbnails jump to a slide.
export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const t = useTranslations("product");
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const go = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto rounded-[24px] bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <div key={src} className="relative w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={i === 0 ? name : `${name} — ${t("photo", { n: i + 1 })}`}
              fill
              priority={i === 0}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => go(i)}
              aria-label={t("photo", { n: i + 1 })}
              aria-current={i === active}
              className={`relative size-20 overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
