-- Run this in the Supabase SQL Editor for your project.
-- Creates a `todos` table scoped per-user with row-level security.

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) > 0 and char_length(title) <= 500),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Added in v2: optional description and due date.
alter table public.todos add column if not exists description text;
alter table public.todos add column if not exists due_date date;

create index if not exists todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

alter table public.todos enable row level security;

drop policy if exists "todos_select_own" on public.todos;
drop policy if exists "todos_insert_own" on public.todos;
drop policy if exists "todos_update_own" on public.todos;
drop policy if exists "todos_delete_own" on public.todos;

create policy "todos_select_own" on public.todos
  for select using (auth.uid() = user_id);

create policy "todos_insert_own" on public.todos
  for insert with check (auth.uid() = user_id);

create policy "todos_update_own" on public.todos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "todos_delete_own" on public.todos
  for delete using (auth.uid() = user_id);
