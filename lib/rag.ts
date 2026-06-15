import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, ProductResource } from "@/lib/types";

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const EMBEDDING_DIMENSIONS = 1536;

type RagChunk = {
  id: string;
  product_id: string;
  resource_id: string | null;
  chunk_text: string;
  source_title: string;
  source_type: string;
  similarity: number;
};

function requireOpenAiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local and restart the dev server.");
  }
  return key;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function chunkText(text: string, maxLength = 1200, overlap = 180) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + maxLength, normalized.length);
    chunks.push(normalized.slice(start, end));
    if (end === normalized.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}

async function openAiRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireOpenAiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenAI request failed with ${response.status}`);
  }

  return payload;
}

export async function embedText(input: string) {
  const payload = await openAiRequest<{ data: Array<{ embedding: number[] }> }>("embeddings", {
    model: EMBEDDING_MODEL,
    input,
    dimensions: EMBEDDING_DIMENSIONS
  });

  return payload.data[0]?.embedding ?? [];
}

async function embedMany(inputs: string[]) {
  if (!inputs.length) return [];
  const payload = await openAiRequest<{ data: Array<{ embedding: number[]; index: number }> }>("embeddings", {
    model: EMBEDDING_MODEL,
    input: inputs,
    dimensions: EMBEDDING_DIMENSIONS
  });

  return payload.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

export function productToIndexText(product: Pick<Product, "name" | "category" | "manufacturer" | "short_description" | "detailed_description" | "tags">) {
  return [
    `Product: ${product.name}`,
    `Category: ${product.category}`,
    `Manufacturer: ${product.manufacturer}`,
    `Summary: ${product.short_description}`,
    `Details: ${product.detailed_description}`,
    `Tags: ${product.tags?.join(", ") || "none"}`
  ].join("\n");
}

export function resourceToIndexText(
  resource: Pick<ProductResource, "title" | "resource_type" | "description" | "external_url" | "public_url">,
  searchableContent?: string
) {
  return [
    `Resource: ${resource.title}`,
    `Type: ${resource.resource_type}`,
    resource.description ? `Description: ${resource.description}` : "",
    resource.external_url ? `External URL: ${resource.external_url}` : "",
    resource.public_url ? `File URL: ${resource.public_url}` : "",
    searchableContent ? `Searchable content: ${searchableContent}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export async function replaceProductChunks(
  supabase: SupabaseClient,
  productId: string,
  text: string,
  sourceTitle: string
) {
  await supabase.from("product_resource_chunks").delete().eq("product_id", productId).is("resource_id", null);
  await insertChunks(supabase, {
    productId,
    resourceId: null,
    sourceTitle,
    sourceType: "product",
    text
  });
}

export async function replaceResourceChunks(
  supabase: SupabaseClient,
  productId: string,
  resourceId: string,
  text: string,
  sourceTitle: string,
  sourceType: string
) {
  await supabase.from("product_resource_chunks").delete().eq("resource_id", resourceId);
  await insertChunks(supabase, {
    productId,
    resourceId,
    sourceTitle,
    sourceType,
    text
  });
}

async function insertChunks(
  supabase: SupabaseClient,
  input: {
    productId: string;
    resourceId: string | null;
    sourceTitle: string;
    sourceType: string;
    text: string;
  }
) {
  const chunks = chunkText(input.text);
  if (!chunks.length) return;

  const embeddings = await embedMany(chunks);
  const rows = chunks.map((chunk, index) => ({
    product_id: input.productId,
    resource_id: input.resourceId,
    chunk_text: chunk,
    source_title: input.sourceTitle,
    source_type: input.sourceType,
    chunk_index: index,
    embedding: embeddings[index]
  }));

  const { error } = await supabase.from("product_resource_chunks").insert(rows);
  if (error) throw new Error(error.message);
}

export async function retrieveProductContext(supabase: SupabaseClient, productId: string, question: string) {
  const queryEmbedding = await embedText(question);
  const { data, error } = await supabase.rpc("match_product_chunks", {
    query_embedding: queryEmbedding,
    match_product_id: productId,
    match_count: 6,
    match_threshold: 0.2
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as RagChunk[];
}

export async function answerWithContext(input: {
  productName: string;
  question: string;
  context: RagChunk[];
}) {
  const contextText = input.context
    .map((chunk, index) => `[${index + 1}] ${chunk.source_title} (${chunk.source_type})\n${chunk.chunk_text}`)
    .join("\n\n");

  const payload = await openAiRequest<{ choices: Array<{ message?: { content?: string } }> }>("chat/completions", {
    model: CHAT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are ProductIQ's product support assistant. Answer using only the provided product context. If the context is not enough, say what is missing and suggest checking the uploaded resources. Be concise and practical."
      },
      {
        role: "user",
        content: `Product: ${input.productName}\n\nQuestion: ${input.question}\n\nRetrieved context:\n${contextText || "No relevant chunks found."}`
      }
    ]
  });

  return payload.choices[0]?.message?.content?.trim() || "I could not generate an answer from the available product context.";
}
