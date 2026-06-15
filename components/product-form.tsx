import { Save } from "lucide-react";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Input, Label, SubmitButton, Textarea } from "@/components/ui/form";
import type { ProductWithMedia } from "@/lib/types";

export function ProductForm({ product }: { product?: ProductWithMedia }) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct;

  return (
    <form action={action} className="grid gap-5 rounded-lg border bg-background p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={product?.category} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input id="manufacturer" name="manufacturer" defaultValue={product?.manufacturer} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" name="tags" defaultValue={product?.tags?.join(", ")} placeholder="wifi, hardware, setup" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="short_description">Short description</Label>
        <Input id="short_description" name="short_description" defaultValue={product?.short_description} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="detailed_description">Detailed description</Label>
        <Textarea id="detailed_description" name="detailed_description" defaultValue={product?.detailed_description} required />
      </div>
      <label className="flex items-center gap-3 text-sm text-muted-foreground">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} className="h-4 w-4 rounded border" />
        Feature this product on the marketplace homepage
      </label>
      <SubmitButton className="w-fit">
        <Save className="h-4 w-4" />
        {product ? "Save product" : "Create product"}
      </SubmitButton>
    </form>
  );
}
