import Image from "next/image";
import { Factory } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import type { ProductWithMedia } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithMedia }) {
  const image = product.product_images?.[0]?.public_url;

  return (
    <article className="group overflow-hidden rounded-lg border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="relative aspect-[4/3] bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.product_images[0]?.alt_text ?? product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Factory className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="mb-2 inline-flex rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
            {product.category}
          </div>
          <h3 className="line-clamp-1 text-lg font-semibold">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.manufacturer}</p>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        <ButtonLink href={`/products/${product.id}`} variant="secondary" className="w-full">
          Open product
        </ButtonLink>
      </div>
    </article>
  );
}
