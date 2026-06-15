import { Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export function SearchFilters({
  categories,
  search,
  category
}: {
  categories: string[];
  search?: string;
  category?: string;
}) {
  return (
    <form className="grid gap-3 rounded-lg border bg-background p-3 shadow-sm md:grid-cols-[1fr_220px_auto]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={search}
          placeholder="Search products, categories, manufacturers"
          className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </label>
      <select
        name="category"
        defaultValue={category ?? ""}
        className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground" type="submit">
          Search
        </button>
        {(search || category) && (
          <ButtonLink href="/products" variant="secondary">
            Clear
          </ButtonLink>
        )}
      </div>
    </form>
  );
}
