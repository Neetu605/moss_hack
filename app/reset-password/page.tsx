import { updatePassword } from "@/app/actions/auth";
import { Input, Label, SubmitButton } from "@/components/ui/form";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-lg border bg-background p-6 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
        {params.error && <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p>}
        <form action={updatePassword} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <SubmitButton className="w-full">Update password</SubmitButton>
        </form>
      </div>
    </div>
  );
}
