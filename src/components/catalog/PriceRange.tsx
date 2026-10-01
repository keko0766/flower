"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

type Props = {
  bounds: { min: number; max: number };
  value: [number, number];
  onCommit: (value: [number, number]) => void;
};

const STEP = 500;

// Dual-thumb slider built from two overlaid range inputs; commits on release.
export default function PriceRange({ bounds, value, onCommit }: Props) {
  const [[lo, hi], setRange] = useState(value);
  const span = bounds.max - bounds.min || 1;
  const pct = (v: number) => ((v - bounds.min) / span) * 100;
  const commit = () => onCommit([lo, hi]);

  const thumb =
    "pointer-events-none absolute inset-0 h-1.5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-ink";

  return (
    <div className="mt-4">
      <div className="relative h-1.5 rounded-full bg-line">
        <div
          className="absolute h-full rounded-full bg-blush"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label="min"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={lo}
          onChange={(e) => setRange([Math.min(Number(e.target.value), hi - STEP), hi])}
          onPointerUp={commit}
          onKeyUp={commit}
          className={thumb}
        />
        <input
          type="range"
          aria-label="max"
          min={bounds.min}
          max={bounds.max}
          step={STEP}
          value={hi}
          onChange={(e) => setRange([lo, Math.max(Number(e.target.value), lo + STEP)])}
          onPointerUp={commit}
          onKeyUp={commit}
          className={thumb}
        />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span>{formatPrice(lo)}</span>
        <span>{formatPrice(hi)}</span>
      </div>
    </div>
  );
}
