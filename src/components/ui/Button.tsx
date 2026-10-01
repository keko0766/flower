import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

const variants = {
  primary: "bg-ink text-white hover:bg-rose",
  secondary: "bg-blush text-ink hover:bg-blush-dark",
  outline: "border border-ink text-ink hover:bg-ink hover:text-white",
};

type Props = {
  variant?: keyof typeof variants;
  href?: ComponentProps<typeof Link>["href"];
} & ComponentProps<"button">;

export default function Button({
  variant = "primary",
  href,
  className = "",
  children,
  ...rest
}: Props) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors duration-200 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
