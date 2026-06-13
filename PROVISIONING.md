# Provisioning — Supabase auth + database

Real Google sign-in and the Postgres database, provisioned under **marcellohaupt@gmail.com**.
This records what's set up and how to maintain it.

## What's live

- **Supabase project:** `couples-budget` (ref `rodheuixrkpemnlyxses`), org **Starbird**, region Europe.
  - URL: `https://rodheuixrkpemnlyxses.supabase.co`
  - Schema in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — applied. RLS on every table.
  - Auth: Site URL + redirect allow-list set to the Pages URL and `localhost:5173`.
- **Google OAuth client:** created in Google Cloud project **OpenClaw Calendar** (`openclaw-calendar-487220`),
  client name "Couples Budget", type Web application.
  - Authorized JS origins: `https://starbirdbeats.github.io`, `http://localhost:5173`
  - Redirect URI: `https://rodheuixrkpemnlyxses.supabase.co/auth/v1/callback`
  - Enabled as the Google provider in Supabase.
- **App credentials:** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (the publishable key — safe in the
  client bundle; RLS is the boundary). In `.env` locally and as GitHub Actions **repository variables**
  for the Pages build.

## Notes / maintenance

1. **Provisioning token** — a temporary Supabase access token (`couples-budget-provision`) was used to apply
   the schema via the Management API and was **deleted** afterward. Nothing in the app uses it (the client
   uses the publishable anon key).
2. **OAuth client home (cosmetic).** The Google OAuth client lives in the *OpenClaw Calendar* Google Cloud
   project. Google's consent screen shows the Supabase domain (`…supabase.co`), so this is invisible to users
   in practice. If you ever want a dedicated project anyway: create one, configure its consent screen, make a
   new Web client (redirect URI = the Supabase callback), and swap the client ID/secret into the Supabase
   Google provider. (A first attempt at a dedicated project stalled on IAM propagation — retry later.)
3. **Test users.** OpenClaw's consent screen is in *Testing* mode; `marcellohaupt@gmail.com` is already a
   test user. When the partner starts logging in (Scope B), add their email as a test user too, or publish a
   dedicated app.

## Local setup

```bash
cp .env.example .env   # fill in URL + anon key (values above)
npm install
npm run dev
```
