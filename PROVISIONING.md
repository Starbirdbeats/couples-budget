# Provisioning — Supabase auth + database

One-time cloud setup for real Google sign-in and the Postgres database. ~10 minutes.
Everything is done as **marcellohaupt@gmail.com**.

## 1. Supabase project

1. Sign in at https://supabase.com/dashboard (GitHub or email).
2. **New project** → name `couples-budget`, pick a region near you (e.g. `Frankfurt (eu-central-1)`),
   let it generate a database password (you don't need it for the app — RLS + the anon key are what the client uses).
3. Wait ~2 min for it to provision.

## 2. Apply the schema

1. In the project: **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and **Run**.
3. Confirm under **Table editor** that `households`, `household_members`, `categories`,
   `transactions`, `budgets`, `funds`, `contributions` all exist with RLS enabled (shield icon).

## 3. Google OAuth client (Google Cloud Console)

1. In Supabase: **Authentication → Sign In / Providers → Google**. Copy the **Callback URL**
   (looks like `https://<ref>.supabase.co/auth/v1/callback`). Leave this tab open.
2. Go to https://console.cloud.google.com → create/select a project (e.g. `couples-budget`).
3. **APIs & Services → OAuth consent screen** → External → fill app name + your email → save.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID** → type **Web application**.
   - **Authorized JavaScript origins:** `https://starbirdbeats.github.io` and `http://localhost:5173`
   - **Authorized redirect URIs:** paste the Supabase Callback URL from step 1.
   - Create → copy the **Client ID** and **Client secret**.
5. Back in Supabase Google provider: paste **Client ID** + **Client secret**, toggle **Enable**, **Save**.

## 4. Allowed redirect URLs (Supabase)

**Authentication → URL Configuration:**
- **Site URL:** `https://starbirdbeats.github.io/couples-budget/`
- **Redirect URLs:** add `https://starbirdbeats.github.io/couples-budget/**` and `http://localhost:5173/**`

## 5. App credentials

**Project Settings → API**, copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

Put them in `.env` (local) and as the build env for CI. Both are publishable — the anon key
is safe in a static bundle; row-level security is the real boundary.

```bash
cp .env.example .env   # then fill in the two values
```

Once `.env` is filled, hand the two values over and the client wiring + deploy is finished from here.
