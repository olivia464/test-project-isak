export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b-2 border-hairline bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
            To Do / AI
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            Loading…
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="mb-2 h-[clamp(3rem,9vw,7rem)] w-3/5 animate-pulse bg-foreground/10" />
        <div className="mb-10 h-4 w-2/5 animate-pulse bg-foreground/10" />
        <div className="mb-10 h-12 w-full animate-pulse border-2 border-hairline bg-background" />
        <div className="mb-6 h-9 w-full animate-pulse border-2 border-hairline bg-background" />
        <ul className="border-2 border-hairline">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className={
                "flex items-start gap-4 p-4 " +
                (i > 0 ? "border-t-2 border-hairline" : "")
              }
            >
              <span className="h-5 w-5 animate-pulse border-2 border-hairline bg-background" />
              <span className="h-5 flex-1 animate-pulse bg-foreground/10" />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
