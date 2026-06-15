import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Input, Label, Select, SubmitButton } from "@/components/ui/form";

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center px-4 py-10">
      <div className="rounded-lg border bg-background p-6 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight">Create your ProductIQ account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose whether you are publishing products or browsing them.</p>
        {params.error && <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{params.error}</p>}
        <form action={signup} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="account_type">Account type</Label>
            <Select id="account_type" name="account_type" defaultValue="company" required>
              <option value="company">Company</option>
              <option value="user">User</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input id="company_name" name="company_name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <SubmitButton className="sm:col-span-2">Create account</SubmitButton>
        </form>
        <p className="mt-5 text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="font-medium text-foreground">Log in</Link>
        </p>
      </div>
    </div>
  );
}
