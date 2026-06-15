"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AccountType } from "@/lib/types";
import { hasSupabaseConfig } from "@/lib/supabase/config";

function requireSupabase() {
  if (!hasSupabaseConfig()) redirect("/login?error=Add%20Supabase%20environment%20variables%20before%20using%20authentication.");
}

export async function signup(formData: FormData) {
  requireSupabase();
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const companyName = String(formData.get("company_name") ?? "");
  const accountType = String(formData.get("account_type") ?? "user") as AccountType;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: accountType === "company" ? companyName : null,
        account_type: accountType
      }
    }
  });

  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function login(formData: FormData) {
  requireSupabase();
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function logout() {
  requireSupabase();
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  requireSupabase();
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`
  });

  if (error) redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  redirect("/forgot-password?sent=true");
}

export async function updatePassword(formData: FormData) {
  requireSupabase();
  const supabase = await createClient();
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}
