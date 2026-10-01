"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import Button from "@/components/ui/Button";

type Slide = { title: string; text: string; image: string };

const QUERY = "(min-width: 768px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

// Crossfading hero; auto-advances on desktop only, mobile shows the first slide.
export default function Hero({ slides, cta }: { slides: Slide[]; cta: string }) {
  const [active, setActive] = useState(0);
  // Extra slides are only fetched on desktop, where they are shown.
  const isDesktop = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!isDesktop || reduce.matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [isDesktop, slides.length]);

  return (
    <section className="relative h-[72vh] min-h-[460px] overflow-hidden bg-ink md:h-[80vh]">
      {slides.map((s, i) => (
        <div
          key={s.image}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
        >
          {(i === 0 || isDesktop) && (
            <Image src={s.image} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-ink/10" />
        </div>
      ))}

      <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-end px-4 pb-14 text-center text-white md:justify-center md:pb-0">
        {slides.map((s, i) => (
          <div key={s.title} className={i === active ? "block" : "hidden"}>
            {i === 0 ? (
              <h1 className="font-serif text-5xl leading-[1.05] md:text-7xl">{s.title}</h1>
            ) : (
              <p className="font-serif text-5xl leading-[1.05] md:text-7xl">{s.title}</p>
            )}
            <p className="mx-auto mt-4 max-w-md text-base text-white/85 md:text-lg">{s.text}</p>
          </div>
        ))}
        <Button href="/catalog" variant="secondary" className="mt-8">{cta}</Button>

        <div className="mt-8 hidden gap-2 md:flex">
          {slides.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              aria-label={`${i + 1} / ${slides.length}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-white" : "w-3 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
