"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function sendAssistantMessage(productId: string, formData: FormData) {
  if (!hasSupabaseConfig()) redirect(`/products/${productId}?error=Configure%20Supabase%20to%20store%20assistant%20messages.`);
  const content = String(formData.get("message") ?? "").trim();
  if (!content) return;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversation } = await supabase
    .from("assistant_conversations")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let conversationId = conversation?.id as string | undefined;

  if (!conversationId) {
    const created = await supabase
      .from("assistant_conversations")
      .insert({ product_id: productId, user_id: user.id, title: "Product chat" })
      .select("id")
      .single();
    conversationId = created.data?.id;
  }

  if (!conversationId) redirect(`/products/${productId}?error=Could%20not%20create%20conversation.`);

  await supabase.from("assistant_messages").insert([
    { conversation_id: conversationId, role: "user", content },
    {
      conversation_id: conversationId,
      role: "assistant",
      content:
        "I have saved your question. The MVP assistant does not perform retrieval yet, but this conversation is ready for a future diagnostic RAG workflow."
    }
  ]);

  revalidatePath(`/products/${productId}`);
}
