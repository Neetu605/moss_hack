import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Create product</h1>
      <p className="mt-2 text-muted-foreground">Add the core product profile first, then upload images and resources.</p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
