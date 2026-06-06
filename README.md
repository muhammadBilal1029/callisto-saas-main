# Callisto SaaS

Next.js (App Router) + TypeScript + Tailwind starter for B2B SaaS with **Auth0 Organizations**, **TanStack React Query**, and **framework-agnostic layers** (domain / application / infrastructure).

## Stack

- **Next.js 16** — App Router, middleware auth
- **Auth0** — Organizations (`org_id` in session)
- **TanStack React Query** — client data fetching at the presentation boundary
- **Zod** — API response validation in the UI layer
- **No database (v1)** — in-memory repository; swap for Postgres/Prisma via ports

## Architecture

```
src/
  domain/           # Pure TypeScript — entities & ports (no Next/React/Auth0)
  application/      # Use cases — depend only on domain ports
  infrastructure/   # Adapters — Auth0 session, in-memory repos
  server/           # Composition root (container.ts)
  presentation/     # React Query hooks, providers, UI components
  app/              # Thin Next.js routes & API handlers
  lib/              # Auth0 client (framework-specific)
```

**Tenant enforcement:** Every `/api/v1/*` handler resolves `org_id` from the server session — never from the client.

## Local development

1. Copy environment template:

   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in Auth0 values (see [Auth0 setup](#auth0-setup) below).

3. Generate `AUTH0_SECRET`:

   ```bash
   openssl rand -hex 32
   ```

4. Create a **Machine-to-Machine** application in Auth0, authorize **Auth0 Management API**, and grant:
   - `read:users`
   - `read:organizations`
   - `read:organization_members`

   Add credentials to `.env.local`:

   ```bash
   AUTH0_MGMT_CLIENT_ID=...
   AUTH0_MGMT_CLIENT_SECRET=...
   ```

5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000), log in, and visit `/dashboard`.

## Auth0 setup

1. Enable **Organizations** on your Auth0 tenant.
2. Create a **Regular Web Application** (not SPA).
3. **Allowed Callback URLs:** `http://localhost:3000/auth/callback`
4. **Allowed Logout URLs:** `http://localhost:3000`
5. On the application, enable **Organization usage** (per your Auth0 plan).
6. Create two test organizations (e.g. Acme, Globex) and add your user to both.
7. Copy **Domain**, **Client ID**, and **Client Secret** into `.env.local`.
8. Create an **M2M** app for the Management API (see step 4 in Local development) for email → org lookup on `/login`.

### Login to a specific organization

```
/auth/login?organization=org_xxxxxxxx&returnTo=/dashboard
```

Org switching in v1: use the header switcher (re-authenticates into the chosen org). For a seamless switcher without re-login, enable the Auth0 **My Organization API** proxy in a follow-up.

## Routes

| Path | Description |
|------|-------------|
| `/` | Marketing landing |
| `/dashboard` | Protected; requires session + `org_id` |
| `/login` | Sign-in — enter workspace slug (or use subdomain); no public org list |
| `/select-org` | Redirects to `/login` (legacy path) |
| `/api/v1/projects` | Tenant-scoped projects (401 / 403 when appropriate) |

## Login (email → org membership)

`/login` uses the **Auth0 Management API** to load only organizations the user belongs to:

1. User enters work email.
2. Server calls `users-by-email` and `users/{id}/organizations`.
3. **One org** → straight to Auth0 with `organization` + `login_hint`.
4. **Multiple orgs** → picker shows **only their** memberships (never all tenants).
5. **No orgs** → generic error; contact administrator.

Optional: **subdomain** auto-login (`acme.localhost:3000`) via `ORG_SLUG_MAP` + `APP_ROOT_HOST`.

## Adding Postgres later

1. Implement `ProjectRepositoryPort` in `src/infrastructure/persistence/` (e.g. Prisma adapter).
2. Register the adapter in `src/server/container.ts` instead of `InMemoryProjectRepository`.
3. Keep domain and application layers unchanged.

Optional: seed per-org project names via `DEMO_ORG_PROJECTS` JSON in `.env.local`:

```json
{
  "org_abc123": [
    { "id": "p1", "name": "Acme onboarding", "status": "active" }
  ]
}
```

## Troubleshooting auth

### "An error occurred during the authorization flow"

This comes from the Auth0 callback (`/auth/callback`). Common fixes:

1. **Restart the dev server** after editing `.env.local` (`Ctrl+C`, then `npm run dev`).
2. **Callback URL must match exactly** in Auth0 → Application → Settings:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000` for Logout URLs
3. **Application type** must be **Regular Web Application** (not SPA).
4. **`parameter organization is required for this client`** — Auth0 needs `organization=org_…` on login. Use `/login` with a workspace slug, a customer subdomain (`acme.localhost:3000`), or a direct invite link — not plain `/auth/login`.
5. **`ERR_TOO_MANY_REDIRECTS` on `/login`** — usually a loop when org is required but login omits `organization`. Ensure `/login` is public (not behind the app auth layout).
6. **Check the error detail** — failed callbacks redirect to `/login` with `message` and `detail` query params.
7. **Next.js 16** — auth routes are mounted via `src/proxy.ts` (not `middleware.ts`).

### `AUTH0_SECRET` / `"ikm" must be at least one byte`

`AUTH0_SECRET` is **not** from Auth0. Generate locally:

```bash
openssl rand -hex 32
```

Put the result in `.env.local`, then restart `npm run dev`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
