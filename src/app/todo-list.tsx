"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  addSubtasks,
  deleteTodo,
  toggleTodo,
  updateTodo,
} from "./actions";
import { DateInput } from "./date-input";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  description: string | null;
  due_date: string | null;
  created_at: string;
};

type Filter = "all" | "today" | "soon" | "overdue" | "done";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "soon", label: "Next 7 days" },
  { key: "overdue", label: "Overdue" },
  { key: "done", label: "Done" },
];

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function plusDaysString(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const [editing, setEditing] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const { counts, filtered } = useMemo(() => {
    const today = todayString();
    const horizon = plusDaysString(7);

    const buckets = {
      all: todos,
      today: todos.filter((t) => !t.completed && t.due_date === today),
      soon: todos.filter(
        (t) =>
          !t.completed &&
          t.due_date !== null &&
          t.due_date >= today &&
          t.due_date <= horizon,
      ),
      overdue: todos.filter(
        (t) => !t.completed && t.due_date !== null && t.due_date < today,
      ),
      done: todos.filter((t) => t.completed),
    } as Record<Filter, Todo[]>;

    let active = buckets[filter];
    if (filter === "today" || filter === "soon" || filter === "overdue") {
      active = [...active].sort((a, b) =>
        (a.due_date ?? "") < (b.due_date ?? "") ? -1 : 1,
      );
    }

    return {
      counts: {
        all: buckets.all.length,
        today: buckets.today.length,
        soon: buckets.soon.length,
        overdue: buckets.overdue.length,
        done: buckets.done.length,
      } as Record<Filter, number>,
      filtered: active,
    };
  }, [todos, filter]);

  return (
    <>
      <nav
        aria-label="Filter to-dos"
        className="mb-6 flex flex-wrap items-stretch border-2 border-hairline"
      >
        {FILTERS.map((f, i) => {
          const isActive = filter === f.key;
          const count = counts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={isActive}
              className={
                "flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] " +
                (i > 0 ? "border-l-2 border-hairline " : "") +
                (isActive
                  ? "bg-foreground text-background"
                  : "bg-background hover:bg-accent hover:text-accent-ink")
              }
            >
              {f.label}{" "}
              <span
                className={
                  "ml-1 " +
                  (isActive ? "text-accent" : "text-ink-muted")
                }
              >
                ({count})
              </span>
            </button>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <p className="border-2 border-dashed border-hairline p-10 text-center text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          {filter === "all"
            ? "No todos yet. Add one above."
            : `Nothing in “${FILTERS.find((f) => f.key === filter)?.label}”.`}
        </p>
      ) : (
        <ul className="border-2 border-hairline">
          {filtered.map((todo, i) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              isFirst={i === 0}
              onEdit={() => setEditing(todo)}
            />
          ))}
        </ul>
      )}

      {editing && (
        <EditModal todo={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function TodoRow({
  todo,
  isFirst,
  onEdit,
}: {
  todo: Todo;
  isFirst: boolean;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  async function handleBreakdown() {
    setBreakdownError(null);
    setIsBreakingDown(true);
    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: todo.title }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const { subtasks } = (await res.json()) as { subtasks: string[] };
      if (!Array.isArray(subtasks) || subtasks.length === 0) {
        throw new Error("Claude didn't return any subtasks.");
      }
      startTransition(() => addSubtasks(subtasks));
    } catch (err) {
      setBreakdownError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsBreakingDown(false);
    }
  }

  return (
    <li
      className={`group flex items-start gap-4 p-4 transition-colors hover:bg-accent/10 ${
        isFirst ? "" : "border-t-2 border-hairline"
      }`}
    >
      <label className="flex cursor-pointer items-center pt-0.5">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) =>
            startTransition(() => toggleTodo(todo.id, e.target.checked))
          }
          className="peer sr-only"
          disabled={isPending}
        />
        <span
          aria-hidden="true"
          className="grid h-5 w-5 place-items-center border-2 border-hairline bg-background peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-foreground peer-focus-visible:ring-offset-2"
        >
          <span
            className={`h-3 w-3 ${todo.completed ? "bg-foreground" : "bg-transparent"}`}
          />
        </span>
      </label>

      <button
        type="button"
        onClick={onEdit}
        className="-m-1 min-w-0 flex-1 cursor-pointer p-1 text-left"
        aria-label={`Edit “${todo.title}”`}
      >
        <span
          className={
            "block " +
            (todo.completed
              ? "text-base text-ink-muted line-through"
              : "text-base text-foreground group-hover:underline group-hover:decoration-accent group-hover:decoration-2 group-hover:underline-offset-4")
          }
        >
          {todo.title}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.16em]">
          {todo.due_date && (
            <DueDateBadge due={todo.due_date} completed={todo.completed} />
          )}
          {todo.description && (
            <span className="line-clamp-1 max-w-xs normal-case tracking-normal text-ink-muted italic">
              {todo.description}
            </span>
          )}
        </span>
        {breakdownError && (
          <span className="mt-2 block border-l-2 border-hot bg-hot/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground">
            {breakdownError}
          </span>
        )}
      </button>

      <div className="flex flex-shrink-0 items-stretch self-stretch">
        <button
          type="button"
          onClick={onEdit}
          className="border-2 border-hairline bg-background px-3 text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-foreground hover:text-background"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleBreakdown}
          disabled={isBreakingDown || todo.completed}
          title="Use Claude to break this into subtasks"
          className="-ml-0.5 border-2 border-hairline bg-accent px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-accent-ink hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:bg-background disabled:text-ink-muted disabled:hover:bg-background disabled:hover:text-ink-muted"
        >
          {isBreakingDown ? "Thinking…" : "AI ↳ Break"}
        </button>
        <button
          type="button"
          onClick={() => startTransition(() => deleteTodo(todo.id))}
          disabled={isPending}
          className="-ml-0.5 border-2 border-hairline bg-background px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground hover:bg-hot hover:text-background disabled:opacity-50"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

function DueDateBadge({
  due,
  completed,
}: {
  due: string;
  completed: boolean;
}) {
  const today = todayString();
  const isOverdue = !completed && due < today;
  const isToday = !completed && due === today;

  const cls = isOverdue
    ? "bg-hot text-background"
    : isToday
      ? "bg-accent text-accent-ink"
      : "bg-foreground text-background";

  return (
    <span className={`px-1.5 py-0.5 font-bold ${cls}`}>
      Due {due}
      {isOverdue && " · Late"}
      {isToday && " · Today"}
    </span>
  );
}

function EditModal({ todo, onClose }: { todo: Todo; onClose: () => void }) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");
  const [dueDate, setDueDate] = useState(todo.due_date ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave() {
    startTransition(async () => {
      await updateTodo(todo.id, {
        title,
        description,
        due_date: dueDate || null,
      });
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-todo-title"
    >
      <div className="w-full max-w-lg border-2 border-hairline bg-background">
        <div className="flex items-center justify-between border-b-2 border-hairline px-5 py-3">
          <h2
            id="edit-todo-title"
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            Edit to-do
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-sm font-bold leading-none hover:text-hot"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-5">
          <Field label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={500}
              className="w-full border-2 border-hairline bg-background px-3 py-2 text-sm focus:bg-accent focus:outline-none"
            />
          </Field>

          <Field label="Description" optional>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Notes, context, links…"
              className="w-full border-2 border-hairline bg-background px-3 py-2 text-sm leading-relaxed focus:bg-accent focus:outline-none"
            />
          </Field>

          <Field label="Due date" optional>
            <DateInput
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border-2 border-hairline bg-background px-3 py-2 text-sm focus:bg-accent focus:outline-none"
            />
          </Field>
        </div>

        <div className="flex items-stretch border-t-2 border-hairline">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 border-r-2 border-hairline bg-background py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-foreground hover:text-background"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !title.trim()}
            className="flex-1 bg-foreground py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-background hover:bg-accent hover:text-accent-ink disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
        {label}
        {optional && (
          <span className="ml-2 font-normal text-ink-muted">— optional</span>
        )}
      </span>
      {children}
    </label>
  );
}
