import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink, Factory, FileText, Tag } from "lucide-react";
import { AssistantPanel } from "@/components/assistant-panel";
import { getProduct } from "@/lib/data";

export default async function ProductPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const product = await getProduct(id);
  if (!product) notFound();

  const images = product.product_images ?? [];
  const resources = product.product_resources ?? [];
  const hero = images[0]?.public_url;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {query.error && <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{query.error}</p>}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
            <div className="overflow-hidden rounded-lg border bg-muted">
              <div className="relative aspect-[4/3]">
                {hero ? (
                  <Image src={hero} alt={images[0]?.alt_text ?? product.name} fill className="object-cover" priority />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Factory className="h-12 w-12" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-lg border bg-background p-6 shadow-sm">
              <div className="mb-3 inline-flex w-fit rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                {product.category}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
              <p className="mt-3 text-muted-foreground">{product.short_description}</p>
              <div className="mt-6 flex items-center gap-3 rounded-md border p-3">
                <Factory className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{product.manufacturer}</p>
                </div>
              </div>
            </div>
          </section>

          {images.length > 1 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Image gallery</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {images.slice(1).map((image) => (
                  <div key={image.id} className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                    <Image src={image.public_url} alt={image.alt_text ?? product.name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Product information</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{product.detailed_description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Resource repository</h2>
            <div className="mt-4 space-y-3">
              {resources.map((resource) => {
                const href = resource.public_url ?? resource.external_url ?? "#";
                const isFile = Boolean(resource.public_url);
                return (
                  <Link
                    key={resource.id}
                    href={href}
                    target="_blank"
                    className="flex items-center justify-between gap-3 rounded-lg border p-4 transition hover:bg-muted"
                  >
                    <span className="flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                      <span>
                        <span className="block font-medium">{resource.title}</span>
                        <span className="text-sm text-muted-foreground">{resource.description || resource.resource_type.replace("_", " ")}</span>
                      </span>
                    </span>
                    {isFile ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  </Link>
                );
              })}
              {!resources.length && <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">No resources have been uploaded yet.</p>}
            </div>
          </section>
        </div>

        <AssistantPanel productId={product.id} />
      </div>
    </div>
  );
}
