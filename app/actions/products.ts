"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ResourceType } from "@/lib/types";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { productToIndexText, replaceProductChunks, replaceResourceChunks, resourceToIndexText } from "@/lib/rag";

async function requireUser() {
  if (!hasSupabaseConfig()) redirect("/login?error=Add%20Supabase%20environment%20variables%20before%20using%20database%20actions.");
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

function tagsFrom(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function productPayloadFrom(formData: FormData, companyId: string) {
  return {
    company_id: companyId,
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    manufacturer: String(formData.get("manufacturer") ?? ""),
    short_description: String(formData.get("short_description") ?? ""),
    detailed_description: String(formData.get("detailed_description") ?? ""),
    tags: tagsFrom(formData.get("tags")),
    featured: formData.get("featured") === "on"
  };
}

async function readSearchableFileText(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return "";
  const lowerName = file.name.toLowerCase();
  const looksText =
    file.type.startsWith("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".csv") ||
    lowerName.endsWith(".json");

  if (!looksText) return "";
  return file.text();
}

export async function createProduct(formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = productPayloadFrom(formData, user.id);
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) redirect(`/dashboard/products/new?error=${encodeURIComponent(error.message)}`);
  try {
    await replaceProductChunks(supabase, data.id, productToIndexText(payload), payload.name);
  } catch (indexError) {
    const message = indexError instanceof Error ? indexError.message : "RAG indexing failed.";
    redirect(`/dashboard/products/${data.id}/edit?error=${encodeURIComponent(`Product created, but indexing failed: ${message}`)}`);
  }
  revalidatePath("/");
  revalidatePath("/products");
  redirect(`/dashboard/products/${data.id}/edit`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = productPayloadFrom(formData, user.id);
  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId);

  if (error) redirect(`/dashboard/products/${productId}/edit?error=${encodeURIComponent(error.message)}`);
  try {
    await replaceProductChunks(supabase, productId, productToIndexText(payload), payload.name);
  } catch (indexError) {
    const message = indexError instanceof Error ? indexError.message : "RAG indexing failed.";
    redirect(`/dashboard/products/${productId}/edit?error=${encodeURIComponent(`Product saved, but indexing failed: ${message}`)}`);
  }
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect(`/dashboard/products/${productId}/edit?saved=true`);
}

export async function deleteProduct(productId: string) {
  const { supabase } = await requireUser();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/");
  revalidatePath("/products");
  redirect("/dashboard");
}

export async function uploadProductImage(productId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) redirect(`/dashboard/products/${productId}/edit`);

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${productId}/${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
  if (upload.error) redirect(`/dashboard/products/${productId}/edit?error=${encodeURIComponent(upload.error.message)}`);

  const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(path);
  await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    public_url: publicData.publicUrl,
    alt_text: String(formData.get("alt_text") ?? "")
  });

  revalidatePath(`/dashboard/products/${productId}/edit`);
  revalidatePath(`/products/${productId}`);
}

export async function deleteProductImage(productId: string, imageId: string, storagePath: string) {
  const { supabase } = await requireUser();
  await supabase.storage.from("product-images").remove([storagePath]);
  await supabase.from("product_images").delete().eq("id", imageId);
  revalidatePath(`/dashboard/products/${productId}/edit`);
  revalidatePath(`/products/${productId}`);
}

export async function addResource(productId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const resourceType = String(formData.get("resource_type") ?? "pdf") as ResourceType;
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const searchableContent = String(formData.get("searchable_content") ?? "");
  const externalUrl = String(formData.get("external_url") ?? "");
  const file = formData.get("file");
  let storagePath: string | null = null;
  let publicUrl: string | null = null;

  if (file instanceof File && file.size > 0) {
    const extension = file.name.split(".").pop() ?? "bin";
    storagePath = `${user.id}/${productId}/${crypto.randomUUID()}.${extension}`;
    const upload = await supabase.storage.from("product-resources").upload(storagePath, file, { upsert: false });
    if (upload.error) redirect(`/dashboard/products/${productId}/edit?error=${encodeURIComponent(upload.error.message)}`);
    publicUrl = supabase.storage.from("product-resources").getPublicUrl(storagePath).data.publicUrl;
  }

  const insertPayload = {
    product_id: productId,
    company_id: user.id,
    title,
    resource_type: resourceType,
    storage_path: storagePath,
    public_url: publicUrl,
    external_url: externalUrl || null,
    description
  };

  const { data: resource, error } = await supabase.from("product_resources").insert(insertPayload).select("*").single();

  if (error) redirect(`/dashboard/products/${productId}/edit?error=${encodeURIComponent(error.message)}`);
  try {
    const fileText = await readSearchableFileText(file);
    await replaceResourceChunks(
      supabase,
      productId,
      resource.id,
      resourceToIndexText(resource, [searchableContent, fileText].filter(Boolean).join("\n\n")),
      title,
      resourceType
    );
  } catch (indexError) {
    const message = indexError instanceof Error ? indexError.message : "RAG indexing failed.";
    redirect(`/dashboard/products/${productId}/edit?error=${encodeURIComponent(`Resource added, but indexing failed: ${message}`)}`);
  }
  revalidatePath(`/dashboard/products/${productId}/edit`);
  revalidatePath(`/products/${productId}`);
}

export async function deleteResource(productId: string, resourceId: string, storagePath?: string | null) {
  const { supabase } = await requireUser();
  if (storagePath) await supabase.storage.from("product-resources").remove([storagePath]);
  await supabase.from("product_resources").delete().eq("id", resourceId);
  revalidatePath(`/dashboard/products/${productId}/edit`);
  revalidatePath(`/products/${productId}`);
}
