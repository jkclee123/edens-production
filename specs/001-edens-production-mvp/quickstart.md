# Eden’s Production MVP — Quickstart (Bun + Next.js + Convex)

This quickstart is for local development and production deployment to Vercel + Convex.

## Prerequisites

- Bun `1.x`
- A Convex account
- A Google Cloud OAuth client (for “Login with Google”)
- A Vercel account (for deployment)

## 1) Install dependencies

```bash
bun install
```

## 2) Set up Convex

Initialize and run Convex in dev:

```bash
bunx convex dev
```

This will create a `convex/` folder (if not present yet), a dev deployment, and print your Convex URL.

Create `.env.local` and set:

- `NEXT_PUBLIC_CONVEX_URL=...` (from `convex dev`)

## 3) Set up Google Login (Auth.js / NextAuth)

Create a Google OAuth client and set redirect URLs for your environment:

- Local: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://<your-vercel-domain>/api/auth/callback/google`

Set these in `.env.local`:

- `AUTH_SECRET=...` (random secret)
- `AUTH_GOOGLE_ID=...`
- `AUTH_GOOGLE_SECRET=...`
- `NEXTAUTH_URL=http://localhost:3000` (local)

## 4) Seed allowlist + locations

Before login can succeed, add at least one email to `CrewEmail` and create at least one `Location`.

Recommended: implement a one-time seed script or a protected admin mutation (to be defined in tasks).

## 5) Run the web app

```bash
bun dev
```

Open `http://localhost:3000`.

## 6) Deployment

### Deploy Convex

```bash
bunx convex deploy
```

### Deploy Next.js to Vercel

- Push the repo to GitHub.
- Import into Vercel.
- Set environment variables in Vercel Project Settings:
  - `NEXT_PUBLIC_CONVEX_URL` (production Convex URL)
  - `AUTH_SECRET`
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`
  - `NEXTAUTH_URL` (your production URL)

If Vercel needs explicit Bun selection, add/update `vercel.json` with:

```json
{
  "bunVersion": "1.x"
}
```


