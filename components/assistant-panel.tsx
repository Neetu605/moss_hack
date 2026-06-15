import { Bot, Lock, Send } from "lucide-react";
import { sendAssistantMessage } from "@/app/actions/assistant";
import { Input } from "@/components/ui/form";
import { getCurrentProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { AssistantMessage } from "@/lib/types";

export async function AssistantPanel({ productId }: { productId: string }) {
  const { user } = await getCurrentProfile();
  let messages: AssistantMessage[] = [];

  if (hasSupabaseConfig() && user) {
    const supabase = await createClient();
    const { data: conversation } = await supabase
      .from("assistant_conversations")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (conversation?.id) {
      const { data } = await supabase
        .from("assistant_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      messages = (data ?? []) as AssistantMessage[];
    }
  }

  return (
    <aside className="rounded-lg border bg-background shadow-sm">
      <div className="border-b p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">MVP chat shell with stored product conversations.</p>
          </div>
        </div>
      </div>
      <div className="flex min-h-80 flex-col justify-between p-5">
        <div className="space-y-3">
          {messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-3 text-sm ${
                  message.role === "user" ? "ml-8 bg-primary text-primary-foreground" : "mr-8 bg-muted"
                }`}
              >
                {message.content}
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Ask a product question to start a stored conversation. Retrieval and diagnostics are intentionally reserved for the next phase.
            </div>
          )}
        </div>
        {user ? (
          <form action={sendAssistantMessage.bind(null, productId)} className="mt-5 flex gap-2">
            <Input name="message" placeholder="Ask about setup, warranty, or troubleshooting" required />
            <button className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground" title="Send message">
              <Send className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="mt-5 flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Log in to save assistant conversations.
          </div>
        )}
      </div>
    </aside>
  );
}
