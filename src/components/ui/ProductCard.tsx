import Image from "next/image";
import AddButton from "@/components/cart/AddButton";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";

type Props = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  image?: string;
  href?: string;
  priority?: boolean;
};

export default function ProductCard({
  id,
  name,
  description,
  price,
  oldPrice,
  image,
  href = "/catalog",
  priority = false,
}: Props) {
  return (
    <article className="group overflow-hidden rounded-[20px] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(43,36,34,0.08)]">
      <Link href={href} className="relative block aspect-[4/5] bg-gradient-to-br from-[#f4d9da] via-blush to-[#cfd8c4]">
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="p-3 md:p-4">
        <h3 className="font-serif text-xl md:text-2xl">
          <Link href={href}>{name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted md:text-sm">{description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold">{formatPrice(price)}</span>
            {oldPrice && (
              <span className="text-xs text-muted line-through">{formatPrice(oldPrice)}</span>
            )}
          </span>
          <AddButton id={id} />
        </div>
      </div>
    </article>
  );
}
