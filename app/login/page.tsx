import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Input, Label, SubmitButton } from "@/components/ui/form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-lg border bg-background p-6 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Access your dashboard and assistant conversations.</p>
        {params.error && <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p>}
        <form action={login} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <SubmitButton className="w-full">Log in</SubmitButton>
        </form>
        <div className="mt-5 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
          <Link href="/signup" className="font-medium">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
