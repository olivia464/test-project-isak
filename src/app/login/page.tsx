import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signIn, signUp } from "./actions";
import { SocialAuth } from "./social-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { error, message } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-2 border-hairline">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
            Todo / AI
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Sign in
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <h1 className="mb-2 text-[clamp(2.5rem,8vw,5rem)] font-black uppercase leading-[0.85] tracking-[-0.03em]">
          Sign in
        </h1>
        <p className="mb-10 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Email + password. New here? Hit sign up.
        </p>

        {message && (
          <p className="mb-6 border-l-4 border-accent bg-accent/15 p-3 text-[11px] uppercase tracking-[0.14em] text-foreground">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-6 border-l-4 border-hot bg-hot/15 p-3 text-[11px] uppercase tracking-[0.14em] text-foreground">
            {error}
          </p>
        )}

        <SocialAuth />

        <div className="my-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          <span aria-hidden="true" className="flex-1 border-t-2 border-hairline" />
          <span>Or with email</span>
          <span aria-hidden="true" className="flex-1 border-t-2 border-hairline" />
        </div>

        <form className="space-y-4">
          <Field label="Email">
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full border-2 border-hairline bg-background px-3 py-2 text-sm focus:bg-accent focus:outline-none"
            />
          </Field>
          <Field label="Password">
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Min 6 chars"
              className="w-full border-2 border-hairline bg-background px-3 py-2 text-sm focus:bg-accent focus:outline-none"
            />
          </Field>

          <div className="flex border-2 border-hairline">
            <button
              formAction={signIn}
              className="flex-1 bg-foreground py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-background hover:bg-accent hover:text-accent-ink"
            >
              Sign in →
            </button>
            <button
              formAction={signUp}
              className="flex-1 border-l-2 border-hairline bg-background py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-foreground hover:text-background"
            >
              Sign up
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
