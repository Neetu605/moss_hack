"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background text-muted-foreground transition hover:text-foreground"
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </form>
  );
}
