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

## Cleanup / maintenance to do

1. **Revoke the provisioning token.** A Supabase personal access token named `couples-budget-provision`
   was created to apply the schema via the Management API. Delete it at
   https://supabase.com/dashboard/account/tokens once you're happy everything works.
2. **Consent-screen branding (cosmetic).** The OAuth client lives in the *OpenClaw Calendar* Google Cloud
   project, so Google's sign-in screen shows "OpenClaw Calendar". For v1 only you sign in, so this is
   harmless. To fix: create a dedicated Google Cloud project for Couples Budget, configure its OAuth
   consent screen, make a new Web client there, and swap the client ID/secret into the Supabase Google
   provider. (A first attempt at a dedicated project stalled on IAM propagation — retrying later should work.)
3. **Test users.** OpenClaw's consent screen is in *Testing* mode; `marcellohaupt@gmail.com` is already a
   test user. When the partner starts logging in (Scope B), add their email as a test user too, or publish
   the dedicated app.

## Local setup

```bash
cp .env.example .env   # fill in URL + anon key (values above)
npm install
npm run dev
```
