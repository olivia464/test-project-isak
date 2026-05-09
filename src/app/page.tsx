import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TodoList } from "./todo-list";
import { DateInput } from "./date-input";
import { addTodo, clearCompleted, signOut } from "./actions";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, title, completed, description, due_date, created_at")
    .order("created_at", { ascending: false });

  const total = todos?.length ?? 0;
  const doneCount = todos?.filter((t) => t.completed).length ?? 0;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b-2 border-hairline bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
            To Do / AI
          </span>
          <div className="flex items-center gap-4">
            <span className="hidden text-[11px] uppercase tracking-[0.14em] text-ink-muted sm:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="border-2 border-hairline bg-background px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-foreground hover:text-background"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h1 className="mb-2 text-[clamp(3rem,9vw,7rem)] font-black uppercase leading-[0.85] tracking-[-0.03em]">
          To Dos
        </h1>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-md text-sm uppercase tracking-[0.14em] text-ink-muted">
            A working list, kept short and broken down by Claude when it gets unwieldy.
          </p>
          {total > 0 && (
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em]">
              <span>
                <span className="text-foreground">{doneCount}</span>
                <span className="text-ink-muted"> / {total} done</span>
              </span>
              {doneCount > 0 && (
                <form action={clearCompleted}>
                  <button
                    type="submit"
                    className="border-2 border-hairline bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-hot hover:text-background"
                  >
                    Clear done
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <form
          action={addTodo}
          className="mb-10 flex flex-wrap items-stretch gap-0 border-2 border-hairline"
        >
          <input
            name="title"
            required
            maxLength={500}
            placeholder="What needs doing?"
            className="min-w-0 flex-1 bg-background px-4 py-3 text-sm placeholder:text-ink-muted focus:bg-accent focus:outline-none"
          />
          <DateInput
            name="due_date"
            aria-label="Due date (optional)"
            title="Due date (optional)"
            className="border-l-2 border-hairline bg-background px-4 py-3 text-sm focus:bg-accent focus:outline-none"
          />
          <button
            type="submit"
            className="border-l-2 border-hairline bg-foreground px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-background hover:bg-accent hover:text-accent-ink"
          >
            Add ↵
          </button>
        </form>

        {error ? (
          <p className="border-2 border-hairline bg-hot/15 p-4 text-sm uppercase tracking-[0.1em] text-foreground">
            Couldn&apos;t load todos: {error.message}
          </p>
        ) : (
          <TodoList todos={todos ?? []} />
        )}
      </main>

      <footer className="border-t-2 border-hairline">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          <span>Test project / Isak</span>
          <span>Powered by Claude · Supabase · Vercel</span>
        </div>
      </footer>
    </div>
  );
}
