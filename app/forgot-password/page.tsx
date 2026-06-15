import { resetPassword } from "@/app/actions/auth";
import { Input, Label, SubmitButton } from "@/components/ui/form";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-lg border bg-background p-6 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">We will email you a secure reset link.</p>
        {params.error && <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p>}
        {params.sent && <p className="mt-4 rounded-md bg-accent p-3 text-sm text-accent-foreground">Reset link sent.</p>}
        <form action={resetPassword} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <SubmitButton className="w-full">Send reset link</SubmitButton>
        </form>
      </div>
    </div>
  );
}
