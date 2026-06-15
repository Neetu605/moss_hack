import { Layers3 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { getCategories, getProducts } from "@/lib/data";

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
      <p className="mt-2 text-muted-foreground">Browse the marketplace by product category.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <ButtonLink
            key={category}
            href={`/products?category=${encodeURIComponent(category)}`}
            variant="secondary"
            className="h-auto justify-between p-5"
          >
            <span className="flex items-center gap-3">
              <Layers3 className="h-5 w-5" />
              <span>{category}</span>
            </span>
            <span className="text-muted-foreground">
              {products.filter((product) => product.category === category).length}
            </span>
          </ButtonLink>
        ))}
      </div>
    </div>
  );
}
