# Eden's Production

A production management web app for Eden's crew, built with Bun, Next.js (App Router), and Convex.

## Features

- 🔐 **Google-only login** with email allowlist gating
- 📦 **Inventory management** with in-place editing, grouping by location
- 🗂️ **Location ordering** per-user customization
- 📋 **Notice board** with creator-only edit/delete permissions

## Tech Stack

- **Runtime**: Bun 1.x
- **Framework**: Next.js 15 (App Router)
- **Backend**: Convex
- **Auth**: Auth.js / NextAuth (Google OAuth)
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel + Convex Cloud

## Prerequisites

- [Bun](https://bun.sh) 1.x
- A [Convex](https://convex.dev) account
- A Google Cloud OAuth client
- A [Vercel](https://vercel.com) account (for deployment)

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL
- `AUTH_SECRET` - A random secret for Auth.js
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `NEXTAUTH_URL` - Your app URL (e.g., `http://localhost:3000`)

### 3. Set up Convex

```bash
bunx convex dev
```

This will:
- Create your Convex deployment
- Generate the Convex URL (add to `.env.local`)
- Start syncing your schema and functions

### 4. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`

### 5. Seed initial data

Before login can work, seed the crew email allowlist and locations:

```bash
bun run scripts/seed.ts
```

### 6. Run the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected app routes
│   │   ├── inventory/     # Inventory management
│   │   ├── notice/        # Notice board
│   │   └── settings/      # User settings
│   └── (auth)/            # Auth routes
│       ├── login/         # Login page
│       └── unauthorized/  # Unauthorized access page
├── components/            # Shared React components
│   ├── ui/               # UI primitives
│   ├── inventory/        # Inventory-specific components
│   ├── notice/           # Notice-specific components
│   └── locationOrder/    # Location order components
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── _auth.ts          # Auth helpers
│   └── *.ts              # Queries & mutations
├── lib/                  # Shared utilities
├── scripts/              # CLI scripts
└── specs/                # Feature specifications
```

## Deployment

### Deploy Convex

```bash
bunx convex deploy
```

### Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Development

### Commands

| Command | Description |
|---------|-------------|
| `bun dev` | Start Next.js dev server |
| `bun build` | Build for production |
| `bun start` | Start production server |
| `bun lint` | Run ESLint |
| `bun run convex:dev` | Start Convex dev server |
| `bun run convex:deploy` | Deploy Convex to production |

## License

Private - Eden's Production

