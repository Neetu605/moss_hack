export type AccountType = "company" | "user";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  account_type: AccountType;
  created_at: string;
};

export type Product = {
  id: string;
  company_id: string;
  name: string;
  category: string;
  manufacturer: string;
  short_description: string;
  detailed_description: string;
  tags: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type ResourceType = "pdf" | "document" | "image" | "video" | "external_link" | "youtube";

export type ProductResource = {
  id: string;
  product_id: string;
  company_id: string;
  title: string;
  resource_type: ResourceType;
  storage_path: string | null;
  public_url: string | null;
  external_url: string | null;
  description: string | null;
  created_at: string;
};

export type ProductResourceChunk = {
  id: string;
  product_id: string;
  resource_id: string | null;
  chunk_text: string;
  source_title: string;
  source_type: string;
  chunk_index: number;
  created_at: string;
};

export type ProductWithMedia = Product & {
  product_images: ProductImage[];
  product_resources?: ProductResource[];
  profiles?: Pick<Profile, "company_name" | "full_name" | "email"> | null;
};

export type AssistantConversation = {
  id: string;
  product_id: string;
  user_id: string;
  title: string;
  created_at: string;
};

export type AssistantMessage = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};
