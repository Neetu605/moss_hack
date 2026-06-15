import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Box, LayoutDashboard, LogIn, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button-link";
import { LogoutButton } from "@/components/logout-button";

export function Header({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg">ProductIQ</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/products" className="transition hover:text-foreground">
            Marketplace
          </Link>
          <Link href="/categories" className="transition hover:text-foreground">
            Categories
          </Link>
          {user ? (
            <Link href="/dashboard" className="transition hover:text-foreground">
              Dashboard
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <ButtonLink href="/dashboard" variant="secondary" className="hidden sm:inline-flex">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </ButtonLink>
              <LogoutButton />
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="secondary" className="hidden sm:inline-flex">
                <LogIn className="h-4 w-4" />
                Login
              </ButtonLink>
              <ButtonLink href="/signup">
                <Box className="h-4 w-4" />
                Sign up
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
