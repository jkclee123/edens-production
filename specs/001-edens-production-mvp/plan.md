# Implementation Plan: Eden’s Production MVP

**Branch**: `001-edens-production-mvp` | **Date**: 2025-12-22 | **Spec**: `specs/001-edens-production-mvp/spec.md`  
**Input**: Feature specification from `specs/001-edens-production-mvp/spec.md`

## Summary

Build “Eden’s Production” as a Bun + Next.js (React) web app backed by Convex, deployed on Vercel, with:

- Google-only login gated by a CrewEmail allowlist (no allowlist match → no access and no user record creation).
- Inventory with in-place editing, grouping by location, and per-user location ordering.
- Location Order Settings page to manage that per-user order.
- Notice board with create/search/edit/delete, with edit/delete restricted to the creator.

## Technical Context

**Language/Version**: TypeScript (Next.js) + Bun `1.x`  
**Primary Dependencies**: Next.js (App Router), React, Convex, Auth.js/NextAuth (Google), Tailwind CSS (or equivalent), Zod (validation)  
**Storage**: Convex (documents + indexes + search indexes)  
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (E2E), contract tests for API schema (GraphQL SDL)  
**Target Platform**: Vercel (web), Convex Cloud (backend)  
**Project Type**: Web application (single repo, Next.js + Convex folder)  
**Performance Goals**:
- Initial load < 2s on 3G, TTI < 3s (per constitution)
- Inventory search/filter updates < 1s at 1k active items + 100 locations (SC-005)
**Constraints**:
- Strict authorization: allowlisted emails only; protect both UI routes and backend data access.
- No silent failures; user-visible errors must be actionable.
- Inventory table: avoid forced horizontal scrollbar; allow native browser scrolling; ~90% width on large screens.
**Scale/Scope**: MVP with 4 primary screens (Login, Inventory, Location Order Settings, Notice), tens of users, up to ~1k inventory items and ~100 locations.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**:
  - TypeScript strict mode; avoid `any`; shared helpers for auth + validation; clear error handling paths.
- **Testing**:
  - Plan includes unit/integration/E2E coverage with targets (80% overall; auth + mutations higher).
  - Contract schema file is produced and can be validated in CI.
- **UX Consistency**:
  - Responsive layouts (mobile-first); keyboard accessible inputs; loading + error states for all async operations.
- **Performance**:
  - Use Next.js App Router + server components where appropriate; keep initial bundle small; avoid N+1 data fetches in Convex by batching/denormalizing.

**Gate Status**: PASS (no violations expected for this MVP plan).

## Project Structure

### Documentation (this feature)

```text
specs/001-edens-production-mvp/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── schema.graphql
└── tasks.md             # Phase 2 output (/speckit.tasks - not created here)
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (app)/
│   ├── inventory/
│   │   └── page.tsx
│   ├── notice/
│   │   └── page.tsx
│   └── settings/
│       └── location-order/
│           └── page.tsx
├── layout.tsx
└── providers.tsx

components/
lib/
styles/

convex/
├── schema.ts
├── auth.config.ts
├── _auth.ts            # shared server-side auth helpers
├── crewEmails.ts
├── inventory.ts
├── locations.ts
├── locationOrders.ts
└── notices.ts

tests/
├── unit/
├── integration/
└── e2e/

middleware.ts            # route protection
vercel.json              # bunVersion, deployment config (if needed)
```

**Structure Decision**: Single Next.js web app at repo root, with Convex functions/schema in `convex/`. This matches the requested stack (Bun + Next.js/React + Convex) and deploys cleanly to Vercel + Convex Cloud.

## Complexity Tracking

None. The design stays within a single web app + a single backend service (Convex) and avoids unnecessary layers/patterns.
