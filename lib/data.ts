import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { sampleProducts } from "@/lib/sample-data";
import type { ProductWithMedia, Profile } from "@/lib/types";

export async function getCurrentProfile() {
  if (!hasSupabaseConfig()) return { user: null, profile: null as Profile | null };
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { user, profile: profile as Profile | null };
}

export async function getProducts({
  search,
  category,
  companyId
}: {
  search?: string;
  category?: string;
  companyId?: string;
} = {}) {
  if (!hasSupabaseConfig()) {
    return sampleProducts.filter((product) => {
      const matchesSearch = search
        ? `${product.name} ${product.category} ${product.manufacturer}`.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesCategory = category ? product.category === category : true;
      return matchesSearch && matchesCategory;
    });
  }

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, product_images(*), product_resources(*), profiles(company_name, full_name, email)")
    .order("created_at", { ascending: false });

  if (companyId) query = query.eq("company_id", companyId);
  if (category) query = query.eq("category", category);
  if (search) query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,manufacturer.ilike.%${search}%`);

  const { data } = await query;
  return (data ?? []) as ProductWithMedia[];
}

export async function getProduct(productId: string) {
  if (!hasSupabaseConfig()) return sampleProducts.find((product) => product.id === productId) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_resources(*), profiles(company_name, full_name, email)")
    .eq("id", productId)
    .single();

  return data as ProductWithMedia | null;
}

export async function getCategories() {
  const products = await getProducts();
  return Array.from(new Set(products.map((product) => product.category))).sort();
}
