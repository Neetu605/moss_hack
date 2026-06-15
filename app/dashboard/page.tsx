import { Plus, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ButtonLink } from "@/components/ui/button-link";
import { getCurrentProfile, getProducts } from "@/lib/data";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export default async function DashboardPage() {
  const { user, profile } = await getCurrentProfile();
  if (hasSupabaseConfig() && !user) redirect("/login");

  const isCompany = profile?.account_type === "company" || !hasSupabaseConfig();
  const products = user && isCompany ? await getProducts({ companyId: user.id }) : await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {profile ? `${profile.account_type} workspace` : "Local preview workspace"}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            {isCompany
              ? "Manage product profiles, media, and support resources."
              : "Review marketplace products and your product assistant conversations."}
          </p>
        </div>
        {isCompany && (
          <ButtonLink href="/dashboard/products/new">
            <Plus className="h-4 w-4" />
            New product
          </ButtonLink>
        )}
      </div>

      {!hasSupabaseConfig() && (
        <div className="mb-6 rounded-lg border bg-accent p-4 text-sm text-accent-foreground">
          Add Supabase keys from `.env.example` and run `supabase/schema.sql` to enable live authentication, database writes, and storage uploads.
        </div>
      )}

      {!isCompany && (
        <div className="rounded-lg border bg-background p-6 shadow-sm">
          <UserRound className="h-6 w-6" />
          <h2 className="mt-4 text-lg font-semibold">User account</h2>
          <p className="mt-2 text-muted-foreground">Use the marketplace to browse products and open assistant panels.</p>
        </div>
      )}

      {isCompany && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="space-y-3">
              <ProductCard product={product} />
              <ButtonLink href={`/dashboard/products/${product.id}/edit`} variant="secondary" className="w-full">
                Edit product
              </ButtonLink>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
