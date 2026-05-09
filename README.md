# test-project-isak

A small Next.js to-do app backed by Supabase, with a Claude-powered "AI breakdown" button that splits a vague to-do into concrete subtasks. Editorial visual style inspired by [dazeddigital.com](https://www.dazeddigital.com): Inter typography (Haas-alike), pale-pink accent, sharp 2px black hairlines, uppercase tracked labels.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) — uses the new `proxy.ts` convention (formerly `middleware.ts`)
- **Supabase** — Postgres + email/password & Google OAuth + Row Level Security
- **Anthropic Claude** (Haiku 4.5) via `@anthropic-ai/sdk`, called with forced tool use for reliable structured output
- **Vercel** — deployment target with auto-deploy on push

## Quick start

1. Copy env template and fill in values:
   ```bash
   cp .env.local.example .env.local
   ```
2. Install + run:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000.

## Cloud setup

### Supabase

1. Create a project at https://supabase.com/dashboard.
2. From `Project Settings → API`, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / `Publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Open `SQL Editor` and run [`supabase/schema.sql`](./supabase/schema.sql) — creates the `todos` table with RLS scoped per user.
4. `Authentication → URL Configuration`:
   - **Site URL**: your Vercel production URL
   - **Redirect URLs**: add `https://<your-vercel-url>/**` and `http://localhost:3000/**`
5. (Optional) `Authentication → Providers → Email` — disable "Confirm email" if you want to skip the confirmation step in testing.

### Anthropic

1. Create a key at https://console.anthropic.com/settings/keys.
2. Set `ANTHROPIC_API_KEY` in `.env.local` and in Vercel's project env vars (Production / Preview / Development).
3. Top up at least a few dollars of API credit — each `/api/breakdown` call costs a small fraction of a cent on Haiku 4.5.

### Google OAuth (optional but recommended)

1. https://console.cloud.google.com → create a project.
2. `APIs & Services → OAuth consent screen` → External, fill app name + support email. While in *Testing*, add yourself (and any reviewers) as test users so Google won't block sign-in.
3. `APIs & Services → Credentials → + Create Credentials → OAuth client ID → Web application`:
   - **Authorized JavaScript origins**: `https://<your-vercel-url>`, `http://localhost:3000`
   - **Authorized redirect URIs**: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret**.
5. Supabase → `Authentication → Providers → Google` → toggle on, paste both, save.

### Vercel

1. Push the repo to GitHub.
2. Import at https://vercel.com/new.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY` under Project Settings → Environment Variables (Production + Preview + Development).
4. Deploy. Subsequent `git push` to `main` redeploys automatically.

## Project layout

```
src/
  app/
    api/breakdown/route.ts   # POST → Claude (tool use) → { subtasks: string[] }
    auth/confirm/route.ts    # Handles ?code= (PKCE / Google) and ?token_hash= (email OTP)
    login/
      page.tsx               # Email + password form, Google button on top
      social-auth.tsx        # Client component calling supabase.auth.signInWithOAuth
      actions.ts             # signIn / signUp server actions
    actions.ts               # add / toggle / update / delete / addSubtasks / clearCompleted / signOut
    page.tsx                 # Auth-gated to-do list (server component)
    todo-list.tsx            # Client component: filter tabs, click-to-edit, AI breakdown
    date-input.tsx           # Client wrapper that calls showPicker() on click/focus
    error.tsx                # Error boundary
    loading.tsx              # Skeleton during initial fetch
    icon.tsx                 # Dynamic favicon
    opengraph-image.tsx      # Dynamic OG card for link previews
    layout.tsx               # Root layout, Inter (Haas-alike) font
    globals.css              # CSS vars (--accent, --hot, --hairline) + Tailwind theme
  lib/supabase/
    client.ts                # Browser client
    server.ts                # Server client (uses cookies())
    middleware.ts            # Session-refresh helper for proxy.ts
  proxy.ts                   # Next 16 proxy (auth gate)
supabase/
  schema.sql                 # todos table + RLS policies
```

## Things deliberately left simple

- **No tests** — scaffold a testing approach you like (Vitest + Playwright is a reasonable default).
- **No rate limiting** on `/api/breakdown` — the auth check is the only gate. Vercel's WAF + Anthropic's per-key limits are the practical ceiling.
- **No optimistic updates** — server actions + revalidatePath, plain and obvious. Could add `useOptimistic` for snappier UX.
- **No "undo" on delete** — destructive actions are immediate.
- **Email confirmation flow** is wired but trades off setup friction; turn it off in Supabase if you'd rather skip while iterating.

## What's being tested

Realistic full-stack skills: schema design with RLS, env var hygiene, server vs. client components, server actions, third-party API integration with auth + structured output, multiple auth providers, and a working Vercel deployment.
