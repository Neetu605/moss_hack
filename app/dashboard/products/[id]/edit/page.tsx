import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/products";
import { MediaManager } from "@/components/media-manager";
import { ProductForm } from "@/components/product-form";
import { getProduct } from "@/lib/data";

export default async function EditProductPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Edit {product.name}</h1>
          <p className="mt-2 text-muted-foreground">Update product information and manage support resources.</p>
        </div>
        <form action={deleteProduct.bind(null, product.id)}>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete product
          </button>
        </form>
      </div>
      {query.saved && <p className="mb-4 rounded-md bg-accent p-3 text-sm text-accent-foreground">Product saved.</p>}
      {query.error && <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{query.error}</p>}
      <div className="grid gap-8">
        <ProductForm product={product} />
        <MediaManager product={product} />
      </div>
    </div>
  );
}
