import type { ComponentProps } from "react";

type Props = { active?: boolean } & ComponentProps<"button">;

export default function Chip({ active, className = "", ...rest }: Props) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-blush bg-blush"
          : "border-line bg-white hover:border-blush"
      } ${className}`}
      {...rest}
    />
  );
}
