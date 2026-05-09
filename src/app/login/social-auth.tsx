"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SocialAuth() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setIsPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      setError(error.message);
      setIsPending(false);
    }
    // On success the browser is redirected to Google.
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="border-l-4 border-hot bg-hot/15 p-3 text-[11px] uppercase tracking-[0.14em] text-foreground">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 border-2 border-hairline bg-background py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        <GoogleMark />
        {isPending ? "Redirecting…" : "Continue with Google"}
      </button>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      viewBox="0 0 18 18"
      width="14"
      height="14"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.9-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
