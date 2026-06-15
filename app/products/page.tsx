import { ProductCard } from "@/components/product-card";
import { SearchFilters } from "@/components/search-filters";
import { getCategories, getProducts } from "@/lib/data";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ search: params.q, category: params.category }),
    getCategories()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Product marketplace</h1>
        <p className="mt-2 text-muted-foreground">Search product profiles, support repositories, and manufacturers.</p>
      </div>
      <SearchFilters categories={categories} search={params.q} category={params.category} />
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!products.length && (
        <div className="mt-8 rounded-lg border bg-muted p-8 text-center text-muted-foreground">
          No products matched your search.
        </div>
      )}
    </div>
  );
}
