"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-2 border-hairline">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
            To Do / AI
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Error
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="mb-2 text-[clamp(2.5rem,8vw,5rem)] font-black uppercase leading-[0.85] tracking-[-0.03em]">
          Whoops
        </h1>
        <p className="mb-8 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Something broke. The details are below — try again, or refresh the page.
        </p>

        <pre className="mb-8 max-h-64 overflow-auto border-2 border-hairline bg-foreground/5 p-4 text-xs leading-relaxed">
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>

        <div className="flex border-2 border-hairline">
          <button
            type="button"
            onClick={reset}
            className="flex-1 bg-foreground py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-background hover:bg-accent hover:text-accent-ink"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex flex-1 items-center justify-center border-l-2 border-hairline bg-background py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-foreground hover:text-background"
          >
            Back home
          </a>
        </div>
      </main>
    </div>
  );
}
