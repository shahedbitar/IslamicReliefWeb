# Database Setup (Neon + Netlify) — What you need to do

This project currently runs on Netlify + Express and can work with Neon Postgres.

## 1) Create/confirm your Neon database

1. Create a Neon project (or use your existing one).
2. Copy your connection string.
3. In Neon, ensure SSL is enabled (default in Neon).

## 2) Configure environment variables in Netlify

In **Netlify → Site settings → Environment variables**, add:

- `NETLIFY_DATABASE_URL` (auto-provided by Netlify Neon extension) **or** `NEON_DATABASE_URL` / `DATABASE_URL` → your Neon connection string
- `URL` (or `SITE_URL`) → your Netlify site URL (e.g. `https://your-site.netlify.app`)
- `JWT_SECRET` (or `NETLIFY_JWT_SECRET`) → a strong random string for server-side token checks

## 3) Configure local development `.env`

Create `.env` in repo root:

```bash
# Use one of these DB vars (Netlify extension commonly injects NETLIFY_DATABASE_URL)
NETLIFY_DATABASE_URL=postgresql://...
# or
NEON_DATABASE_URL=postgresql://...
URL=http://localhost:8080
JWT_SECRET=replace_with_long_random_secret
```

## 4) Validate your setup

Run locally:

```bash
pnpm dev
```

Then visit:

- `GET /api/setup/status`
- Example: `http://localhost:8080/api/setup/status`

You should see:

- `ready: true`
- all checks `true`
- `missing: []`

If your Neon extension is connected (like in your screenshot), `NETLIFY_DATABASE_URL` is usually the correct variable to rely on.

## 5) Important note about persistence

Environment setup alone does **not** make app data shared across users.
To complete full DB persistence for all users/devices, the app still needs:

- server CRUD routes (events/tasks/calendar/leaderboard)
- Neon-backed SQL storage for those routes
- client-side fetch/query usage instead of local-only storage

---

If you want, the next implementation step is to wire leaderboard CRUD first (smallest slice),
then migrate events/tasks/calendar in phases.
