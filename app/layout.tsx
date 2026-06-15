import type { Metadata } from "next";
import type React from "react";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "ProductIQ",
  description: "A modern product knowledge marketplace for support resources and product assistance."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("productiq-theme")?.value === "dark" ? "dark" : "";
  const user = hasSupabaseConfig()
    ? (await (await createClient()).auth.getUser()).data.user
    : null;

  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeScript />
        <Header user={user} />
        <main>{children}</main>
      </body>
    </html>
  );
}
