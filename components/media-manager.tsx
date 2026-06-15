import Image from "next/image";
import { FileText, Link2, Trash2, Upload } from "lucide-react";
import { addResource, deleteProductImage, deleteResource, uploadProductImage } from "@/app/actions/products";
import { Input, Label, Select, SubmitButton, Textarea } from "@/components/ui/form";
import type { ProductWithMedia } from "@/lib/types";

export function MediaManager({ product }: { product: ProductWithMedia }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border bg-background p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Product images</h2>
        <form action={uploadProductImage.bind(null, product.id)} className="mt-4 grid gap-3">
          <Input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required />
          <Input name="alt_text" placeholder="Alt text" />
          <SubmitButton>
            <Upload className="h-4 w-4" />
            Upload image
          </SubmitButton>
        </form>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {product.product_images?.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-lg border">
              <div className="relative aspect-video bg-muted">
                <Image src={image.public_url} alt={image.alt_text ?? product.name} fill className="object-cover" />
              </div>
              <form action={deleteProductImage.bind(null, product.id, image.id, image.storage_path)} className="p-2">
                <button className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border text-sm text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-background p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Support resources</h2>
        <form action={addResource.bind(null, product.id)} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource_type">Type</Label>
              <Select id="resource_type" name="resource_type" required>
                <option value="pdf">PDF manual</option>
                <option value="document">Text document</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="external_link">External link</option>
                <option value="youtube">YouTube link</option>
              </Select>
            </div>
          </div>
          <Input name="file" type="file" />
          <Input name="external_url" type="url" placeholder="https://example.com/resource" />
          <Textarea name="description" placeholder="Short description" />
          <Textarea
            name="searchable_content"
            placeholder="Searchable content for the assistant. Paste manual text, troubleshooting steps, specs, warranty notes, or transcript text here."
          />
          <SubmitButton>
            <Upload className="h-4 w-4" />
            Add resource
          </SubmitButton>
        </form>
        <div className="mt-5 space-y-3">
          {product.product_resources?.map((resource) => (
            <div key={resource.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
              <div className="flex gap-3">
                {resource.external_url ? <Link2 className="mt-1 h-4 w-4" /> : <FileText className="mt-1 h-4 w-4" />}
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{resource.resource_type.replace("_", " ")}</p>
                </div>
              </div>
              <form action={deleteResource.bind(null, product.id, resource.id, resource.storage_path)}>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-destructive" title="Delete resource">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
