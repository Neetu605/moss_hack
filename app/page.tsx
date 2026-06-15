import { ArrowRight, Layers3, Search, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SearchFilters } from "@/components/search-filters";
import { ButtonLink } from "@/components/ui/button-link";
import { getCategories, getProducts } from "@/lib/data";

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const featured = products.filter((product) => product.featured).slice(0, 3);

  return (
    <div className="shell-grid">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border bg-background px-3 py-1 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-300" />
            Product knowledge for teams and customers
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            ProductIQ
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            A modern SaaS marketplace where companies publish product details, support resources, and a future-ready assistant workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/products">
              Browse products
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/signup" variant="secondary">
              Create company account
            </ButtonLink>
          </div>
        </div>
        <div className="rounded-lg border bg-background p-4 shadow-soft">
          <SearchFilters categories={categories} />
          <div className="mt-4 grid gap-3">
            {featured.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.manufacturer}</p>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{product.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-background">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {categories.slice(0, 6).map((category) => (
            <ButtonLink key={category} href={`/products?category=${encodeURIComponent(category)}`} variant="secondary">
              <Layers3 className="h-4 w-4" />
              {category}
            </ButtonLink>
          ))}
          <ButtonLink href="/products" variant="ghost">
            <Search className="h-4 w-4" />
            All categories
          </ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured products</h2>
            <p className="mt-2 text-muted-foreground">Explore product profiles with centralized support resources.</p>
          </div>
          <ButtonLink href="/products" variant="secondary" className="hidden sm:inline-flex">
            View marketplace
          </ButtonLink>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {(featured.length ? featured : products.slice(0, 3)).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
