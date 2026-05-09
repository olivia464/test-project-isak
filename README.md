# test-project-isak

A small Next.js todo app backed by Supabase, with a Claude-powered "AI breakdown" button that splits a vague todo into concrete subtasks.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Supabase** — Postgres + email/password auth + Row Level Security
- **Anthropic Claude** (Haiku 4.5) via `@anthropic-ai/sdk`
- **Vercel** — deployment target

## Quick start

1. Copy env template:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in `.env.local` with real values (see "Cloud setup" below).
3. Install + run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000.

## Cloud setup

### Supabase
1. Create a project at https://supabase.com/dashboard.
2. Copy `Settings → API → Project URL` into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy `Settings → API → anon public` key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Open the SQL Editor and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
5. (Optional) `Authentication → Providers → Email` — disable "Confirm email" if you want to skip the confirmation step during local testing.

### Anthropic
1. Create a key at https://console.anthropic.com/settings/keys.
2. Paste it into `ANTHROPIC_API_KEY` in `.env.local`.

### Vercel
1. Push this repo to GitHub.
2. Import it at https://vercel.com/new.
3. Add the three env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`) in `Project Settings → Environment Variables`.
4. Deploy.

## Project layout

```
src/
  app/
    api/breakdown/route.ts   # POST → Claude → { subtasks: string[] }
    auth/confirm/route.ts    # Supabase email confirmation handler
    login/                   # sign-in + sign-up form (server actions)
    actions.ts               # add/toggle/delete/addSubtasks/signOut
    page.tsx                 # auth-gated todo list (server component)
    todo-list.tsx            # client component with toggle/delete/AI breakdown
  lib/supabase/
    client.ts                # browser client
    server.ts                # server client (uses cookies())
    middleware.ts            # session-refresh helper for proxy.ts
  proxy.ts                   # Next 16 proxy (formerly middleware.ts)
supabase/
  schema.sql                 # todos table + RLS policies
```

## What's being tested

Realistic full-stack skills: schema design with RLS, env var hygiene, server vs. client components, server actions, third-party API integration with auth + error handling, and a working Vercel deployment.
