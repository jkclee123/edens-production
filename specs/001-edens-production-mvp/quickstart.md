# Eden's Production MVP — Quickstart (Bun + Next.js + Convex)

This quickstart is for local development and production deployment to Vercel + Convex.

## Prerequisites

- Bun `1.x` ([install](https://bun.sh/))
- A Convex account ([sign up](https://convex.dev/))
- A Google Cloud OAuth client (for "Login with Google")
- A Vercel account (for deployment)

## 1) Install dependencies

```bash
bun install
```

## 2) Set up Convex

Initialize and run Convex in dev:

```bash
bun run convex:dev
# or: bunx convex dev
```

This will:
1. Prompt you to log in to Convex (if not already)
2. Create a dev deployment
3. Print your Convex URL

Create `.env.local` with your Convex URL:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

## 3) Set up Google Login (Auth.js / NextAuth)

### Create Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-vercel-domain>/api/auth/callback/google`

### Configure environment variables

Add these to `.env.local`:

```bash
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-random-secret-here

# From Google Cloud Console
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Your app URL (for NextAuth)
NEXTAUTH_URL=http://localhost:3000
```

## 4) Seed the database

Before login can succeed, you must add at least one email to the crew allowlist.

### Using the seed script

```bash
# Seed with default data (edit DEFAULT_CREW_EMAILS in scripts/seed.ts first)
bun run scripts/seed.ts

# Or add specific emails directly
bun run scripts/seed.ts your-email@gmail.com another@example.com
```

The seed script will:
- Add specified emails to the crew allowlist
- Create default locations (Warehouse A, Warehouse B, Office, Studio 1, Studio 2, Storage)

### Customize default data

Edit `scripts/seed.ts` to modify:
- `DEFAULT_CREW_EMAILS` - emails allowed to log in
- `DEFAULT_LOCATIONS` - initial inventory locations

## 5) Run the web app

In two terminal windows:

**Terminal 1 - Convex dev server:**
```bash
bun run convex:dev
```

**Terminal 2 - Next.js dev server:**
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6) Deployment

### Deploy Convex to production

```bash
bun run convex:deploy
# or: bunx convex deploy
```

This will prompt you to select a production deployment and push your schema/functions.

### Deploy Next.js to Vercel

1. Push your repo to GitHub
2. Import the repo into Vercel
3. Set environment variables in Vercel Project Settings:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Your **production** Convex URL |
| `AUTH_SECRET` | Same secret as local (or generate new) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `NEXTAUTH_URL` | Your Vercel production URL (e.g., `https://your-app.vercel.app`) |

4. Deploy!

### Vercel Configuration

The project includes `vercel.json` with Bun runtime configuration:

```json
{
  "bunVersion": "1.x"
}
```

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL |
| `AUTH_SECRET` | Yes | Random secret for NextAuth session encryption |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_URL` | Yes | Base URL of your app |

## Troubleshooting

### "Email not in allowlist" error
Run the seed script with your email:
```bash
bun run scripts/seed.ts your-email@gmail.com
```

### Convex functions not updating
Make sure `bun run convex:dev` is running in a separate terminal.

### Google OAuth redirect error
Verify the redirect URI in Google Cloud Console matches exactly:
- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.com/api/auth/callback/google`


