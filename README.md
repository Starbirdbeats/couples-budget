# Couples Budget

A calm, minimal budgeting PWA for two people — track what you spend, save and share, together.

Implemented from the Claude Design handoff bundle **Couples Budget v2** (Breakdown dashboard, Funds-page design system: lavender neutrals, indigo/rose member identities, Hanken Grotesk, 18px-radius cards, 6px bars with month-pace ticks).

## Features

- **Sign-in + onboarding** — mock Google OAuth account picker, 3-step setup (your name & color, partner's name & color, currency & suggested budgets)
- **Breakdown dashboard** — spent-this-month hero, stacked category bar, per-category budget bars with pace ticks
- **Activity** — day-grouped entries with All / Shared / per-person filters and delete
- **Add entry** — expense or income, category chips, who paid, shared/personal scope
- **Budgets** — editable monthly targets per category, add new categories
- **Funds** — savings goals with targets, contributions and withdrawals
- **PWA** — installable, offline-capable (service worker precache + Google Fonts runtime cache)

**Auth & data:** real Google sign-in via Supabase Auth; data lives in Postgres with row-level security,
scoped to your household. Each signed-in user syncs across their own devices (single-user cloud sync —
a shared-partner-login flow is the planned next step). "Explore the demo instead" runs a seeded,
in-memory demo that never touches the cloud. See [PROVISIONING.md](PROVISIONING.md) for the backend setup.

## Stack

Vite · React 19 · TypeScript · vite-plugin-pwa (Workbox) · Supabase (Postgres + Auth + RLS)

## Development

```bash
npm install
npm run dev        # local dev server
npm run build      # production build to dist/
npm run preview    # serve the production build
node scripts/gen-icons.mjs   # regenerate PWA icons from the app mark
```

## Deployment

Pushed to `main` → GitHub Actions builds and deploys to GitHub Pages (see `.github/workflows/deploy.yml`). The Vite `base` is `/couples-budget/`.
