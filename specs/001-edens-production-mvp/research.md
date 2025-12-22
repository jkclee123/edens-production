# Phase 0 Research: Eden’s Production MVP (Bun + Next.js + Convex + Vercel)

This document resolves all technical unknowns required to proceed with Phase 1 design.

## Decisions

### 1) Stack & project shape

- **Decision**: Build a single Next.js App Router web app (TypeScript + React) at repo root, using **Bun** for package management/scripts and **Convex** for backend/database.
- **Rationale**: Matches requested stack; simplest repo layout; Convex provides typed mutations/queries + real-time updates.
- **Alternatives considered**:
  - Separate `frontend/` + `backend/`: rejected (unnecessary overhead for MVP).
  - Traditional DB (Postgres): rejected (explicit request for Convex).

### 2) Deployment

- **Decision**: Deploy web app to **Vercel** and backend to **Convex Cloud**.
- **Rationale**: Next.js + Vercel is the standard path; Convex is hosted separately and integrates via `NEXT_PUBLIC_CONVEX_URL`.
- **Alternatives considered**:
  - Self-hosting: rejected (adds ops burden; not MVP).

### 3) Bun usage (local + Vercel)

- **Decision**: Use Bun as the package manager and runtime for local development (`bun install`, `bun dev`) and configure Vercel to build with Bun if needed via `vercel.json` (bunVersion `1.x`).
- **Rationale**: Meets “use bun” requirement while staying compatible with Next.js.
- **Alternatives considered**:
  - Use Bun locally but Node on Vercel: acceptable fallback if Vercel configuration requires it.

### 4) Authentication & authorization model

- **Decision**: Use **Auth.js / NextAuth** with **Google** as the only provider and **JWT sessions** (no database adapter). Enforce allowlist gating via the `CrewEmail` table in Convex.
- **Rationale**:
  - UI shows only “Login with Google” (FR-005).
  - JWT sessions avoid creating user rows in an auth database by default, making it easier to satisfy “no user account saved/created” for unauthorized attempts (FR-007).
  - Allowlist is the source of truth in Convex as required by spec.
- **Alternatives considered**:
  - Clerk/Auth0: rejected (adds vendor UI & accounts; harder to guarantee “no user created” semantics).
  - Convex Auth: possible, but allowlist gating prior to any account persistence is less explicit than a NextAuth `signIn` callback.

### 5) How Convex identifies the user (backend security)

- **Decision**: Configure Convex auth to accept a short-lived JWT minted by the web app (derived from the authenticated NextAuth session), so Convex functions can reliably call `auth.getUserIdentity()` and enforce access.
- **Rationale**: Backend access control must not rely on client-passed user IDs. Convex must be able to verify identity independently for all reads/writes.
- **Alternatives considered**:
  - Anonymous Convex access with “userId” params: rejected (insecure).

### 6) Authorization enforcement (defense in depth)

- **Decision**:
  - **Route-level**: Next.js `middleware.ts` redirects unauthenticated users to `/login`.
  - **Backend-level**: every Convex query/mutation that touches protected data calls a shared guard `requireAuthorizedUser()` that checks:
    1) user is authenticated, and
    2) `normalizedEmail` exists in `CrewEmail` (case-insensitive match).
- **Rationale**: Prevents both UI and API bypasses; aligns with SC-001.
- **Alternatives considered**:
  - UI-only checks: rejected (data exposure risk).

### 7) Inventory ordering & grouping rules

- **Decision**:
  - Inventory rows grouped by `locationId`.
  - Special “No location” group (where `locationId == null`) **always first** (FR-010).
  - For remaining locations: if the user has `LocationOrder` values, ordered locations appear first, sorted by ascending `order` (FR-011).
  - Unordered locations appear after ordered ones, with a **stable deterministic ordering**: `location.name` ascending, tie-break by `location._id` (FR-012).
- **Rationale**: Exactly matches requirements and avoids ambiguous ordering.
- **Alternatives considered**:
  - Ordering unordered by creation time: rejected (less predictable to users).

### 8) Search strategy (Inventory + Notices)

- **Decision**: Use Convex indexes for filtering and Convex search indexes (or normalized substring search) for free-text search on:
  - Inventory `name`
  - Notice `content`
- **Rationale**: Keeps response times within SC-005 and avoids full scans as data grows.
- **Alternatives considered**:
  - Client-side filtering only: rejected (won’t scale).

### 9) Testing strategy (constitution compliance)

- **Decision**:
  - Unit/integration: Vitest + React Testing Library (components, hooks, sorting/grouping logic, and Convex function-level tests).
  - E2E: Playwright for critical journeys (login allowlist, inventory edit, notice permissions).
  - Coverage: enforce 80% overall; auth + mutations targeted 95%+ per constitution.
- **Rationale**: Aligns with constitution non-negotiables and MVP risk areas.
- **Alternatives considered**:
  - No E2E: rejected (auth + permissions are critical paths).


