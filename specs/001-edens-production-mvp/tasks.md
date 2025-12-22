---
description: "Actionable, dependency-ordered implementation tasks for Eden’s Production MVP"
---

# Tasks: Eden’s Production MVP

**Input**: Design documents from `specs/001-edens-production-mvp/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/schema.graphql`, `quickstart.md`

**Tests**: Not included (tests were not explicitly requested in `spec.md`).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Every task includes at least one **exact file path** in its description.

## Path Conventions (per `plan.md`)

- Next.js App Router at repo root: `app/`
- Shared UI: `components/`, `lib/`, `styles/`
- Convex backend: `convex/`
- Route protection: `middleware.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Bun + Next.js App Router project at repo root (creates/updates `package.json`, `app/layout.tsx`)
- [X] T002 [P] Configure Tailwind + global styles for branding colors in `tailwind.config.ts` and `app/globals.css`
- [X] T003 [P] Create base repo structure per plan in `components/`, `lib/`, `styles/`, `convex/` (add placeholders like `components/.gitkeep`)
- [X] T004 [P] Add environment templates and docs in `.env.example` and `README.md`
- [X] T005 [P] Add Vercel Bun configuration in `vercel.json`
- [X] T006 Add Convex dev dependency + scripts to `package.json` (e.g., `convex:dev`, `convex:deploy`)
- [X] T007 [P] Add Prettier + ESLint config for Next.js in `.prettierrc` and `.eslintrc.json`
- [X] T008 [P] Add shared UI primitives (button/input/table) in `components/ui/` (e.g., `components/ui/Button.tsx`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Define Convex schema (tables + indexes + search indexes) in `convex/schema.ts` (per `data-model.md`)
- [X] T010 [P] Implement Convex auth guard helper `requireAuthorizedUser` in `convex/_auth.ts`
- [X] T011 [P] Create shared email normalization util in `lib/normalizeEmail.ts`
- [X] T012 Configure Auth.js/NextAuth (Google-only) in `auth.ts` and `app/api/auth/[...nextauth]/route.ts`
- [X] T013 Implement server-side Convex HTTP client wrapper in `lib/convexHttp.ts` (uses `NEXT_PUBLIC_CONVEX_URL`)
- [X] T014 Implement app providers (NextAuth + Convex + UI) in `app/providers.tsx`
- [X] T015 Implement route protection in `middleware.ts` (redirect unauthenticated users to `/login`)
- [X] T016 Implement app shell layout (top bar + collapsible side nav) in `components/AppShell.tsx` and `components/Nav.tsx`
- [X] T017 Apply branding + layout requirements (FR-001..FR-004) in `app/layout.tsx` and `components/AppShell.tsx`
- [X] T018 [P] Add shared loading + error UI in `components/Loading.tsx` and `components/ErrorState.tsx`
- [X] T019 Add app route groups and empty pages (placeholders) in `app/(app)/inventory/page.tsx` and `app/(app)/notice/page.tsx`
- [X] T020 [P] Add settings route placeholder in `app/(app)/settings/location-order/page.tsx`
- [X] T021 Implement seeding entrypoint to create initial crew allowlist + locations via Convex in `scripts/seed.ts`
- [X] T022 [P] Document seeding + env vars in `specs/001-edens-production-mvp/quickstart.md`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Access the app (authorized Google login) (Priority: P1) 🎯 MVP

**Goal**: Google-only login, allowlisted-email gating, and protected app navigation.

**Independent Test**: Attempt login with an allowlisted email vs a non-allowlisted email; confirm unauthorized users cannot reach Inventory/Notice and no `users` row is created for them.

### Implementation for User Story 1

- [X] T023 [P] [US1] Implement `crewEmails` query for allowlist check in `convex/crewEmails.ts`
- [X] T024 [P] [US1] Implement `users` upsert (authorized only) in `convex/users.ts`
- [X] T025 [US1] Enforce allowlist gating in NextAuth `signIn` callback in `auth.ts` (calls `convex/crewEmails.ts` via `lib/convexHttp.ts`)
- [X] T026 [US1] Prevent any user profile creation on unauthorized login in `auth.ts` (only call `convex/users.ts` after allowlist success)
- [X] T027 [US1] Implement login page with Google-only sign-in + clear errors in `app/(auth)/login/page.tsx`
- [X] T028 [US1] Implement unauthorized screen/route in `app/(auth)/unauthorized/page.tsx`
- [X] T029 [US1] Redirect behavior after login/logout in `app/(auth)/login/page.tsx` and `middleware.ts`
- [X] T030 [US1] Show main navigation (Inventory, Notice) only for authorized sessions in `components/AppShell.tsx`
- [X] T031 [US1] Add "cancel/fail login" messaging in `app/(auth)/login/page.tsx`
- [X] T032 [US1] Add allowlist email casing normalization path in `convex/crewEmails.ts` and `lib/normalizeEmail.ts`

**Checkpoint**: US1 is fully functional and independently testable

---

## Phase 4: User Story 2 — View and manage inventory in-place (Priority: P2)

**Goal**: Inventory table grouped by location with in-place add/edit/delete.

**Independent Test**: As an authorized user, add an item, edit name/qty/location inline, and soft-delete it with confirmation.

### Implementation for User Story 2

- [X] T033 [P] [US2] Implement locations listing query for dropdowns in `convex/locations.ts`
- [X] T034 [P] [US2] Implement inventory query (grouped by location; stable ordering; search/filter) in `convex/inventory.ts`
- [X] T035 [P] [US2] Implement inventory create mutation (name="", qty=1, location=null, isActive=true) in `convex/inventory.ts`
- [X] T036 [P] [US2] Implement inventory update mutations (name/qty/location) in `convex/inventory.ts`
- [X] T037 [P] [US2] Implement inventory soft-delete mutation in `convex/inventory.ts`
- [X] T038 [US2] Build Inventory page scaffold + data hooks in `app/(app)/inventory/page.tsx`
- [X] T039 [P] [US2] Implement Inventory toolbar (search + location filter + add button) in `components/inventory/InventoryToolbar.tsx`
- [X] T040 [P] [US2] Implement grouped Inventory table UI in `components/inventory/InventoryTable.tsx`
- [X] T041 [P] [US2] Implement editable name cell with immediate persistence in `components/inventory/EditableNameCell.tsx`
- [X] T042 [P] [US2] Implement qty stepper with integer validation in `components/inventory/QtyStepper.tsx`
- [X] T043 [P] [US2] Implement location dropdown cell in `components/inventory/LocationSelectCell.tsx`
- [X] T044 [US2] Implement delete confirmation UX and mutation call in `components/inventory/DeleteInventoryButton.tsx`

**Checkpoint**: US2 is fully functional and independently testable

---

## Phase 5: User Story 3 — Personalize location ordering (Priority: P3)

**Goal**: Per-user location ordering set in Settings, reflected in Inventory group ordering.

**Independent Test**: Set an order value for a location, then confirm Inventory groups reorder for the same user (null/no-location group remains first).

### Implementation for User Story 3

- [ ] T045 [P] [US3] Implement location order settings query (all locations + order|null) in `convex/locationOrders.ts`
- [ ] T046 [P] [US3] Implement upsert location order mutation in `convex/locationOrders.ts`
- [ ] T047 [US3] Implement Location Order Settings page scaffold + data hooks in `app/(app)/settings/location-order/page.tsx`
- [ ] T048 [P] [US3] Implement editable order cell with immediate persistence in `components/locationOrder/EditableOrderCell.tsx`
- [ ] T049 [US3] Implement stable ordering rules + tie-breakers in `lib/locationOrdering.ts`
- [ ] T050 [US3] Update inventory grouping/order logic to apply per-user orders (FR-011, FR-012) in `convex/inventory.ts`
- [ ] T051 [US3] Add “Location Order Settings” navigation from Inventory in `components/inventory/InventoryToolbar.tsx`
- [ ] T052 [US3] Ensure null-location group always first (FR-010) in `convex/inventory.ts`

**Checkpoint**: US3 is fully functional and independently testable

---

## Phase 6: User Story 4 — Post, search, edit, and delete notices (Priority: P4)

**Goal**: Notice board with create/search/edit/delete; only creator can edit/delete.

**Independent Test**: Create a notice, search by content, edit/delete your notice, and verify you cannot edit/delete someone else’s notice.

### Implementation for User Story 4

- [ ] T053 [P] [US4] Implement notices list query (active only, newest-first, search) in `convex/notices.ts`
- [ ] T054 [P] [US4] Implement create notice mutation (non-empty content) in `convex/notices.ts`
- [ ] T055 [P] [US4] Implement update notice mutation (creator-only) in `convex/notices.ts`
- [ ] T056 [P] [US4] Implement delete notice mutation (creator-only soft delete) in `convex/notices.ts`
- [ ] T057 [US4] Build Notice page scaffold + data hooks in `app/(app)/notice/page.tsx`
- [ ] T058 [P] [US4] Implement notice create form in `components/notice/NoticeComposer.tsx`
- [ ] T059 [P] [US4] Implement notice search input (debounced) in `components/notice/NoticeSearch.tsx`
- [ ] T060 [P] [US4] Implement notice list item UI with conditional edit/delete controls in `components/notice/NoticeCard.tsx`
- [ ] T061 [US4] Implement edit-in-place flow (creator only) in `components/notice/NoticeCard.tsx`

**Checkpoint**: US4 is fully functional and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T062 [P] Add consistent client-side error handling (toast + inline) in `components/ui/Toast.tsx`
- [ ] T063 Add Zod validation helpers for shared rules in `lib/validation.ts`
- [ ] T064 Harden Convex authorization across all modules by using `requireAuthorizedUser` in `convex/_auth.ts` and each file in `convex/*.ts`
- [ ] T065 Improve performance for search/filter (debounce + minimal rerenders) in `components/inventory/InventoryToolbar.tsx` and `components/notice/NoticeSearch.tsx`
- [ ] T066 [P] Add accessibility pass (labels, keyboard nav, focus states) in `components/AppShell.tsx` and `components/ui/*`
- [ ] T067 [P] Ensure quickstart matches reality (env vars, seed commands, run commands) in `specs/001-edens-production-mvp/quickstart.md`
- [ ] T068 [P] Validate GraphQL contract remains in sync by documenting mapping in `specs/001-edens-production-mvp/contracts/schema.graphql`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3 / P1)**: Depends on Foundational
- **User Story 2 (Phase 4 / P2)**: Depends on US1
- **User Story 3 (Phase 5 / P3)**: Depends on US2 (inventory ordering validation requires Inventory)
- **User Story 4 (Phase 6 / P4)**: Depends on US1 (can run in parallel with US2 after US1)
- **Polish (Phase 7)**: Depends on the user stories you intend to ship

### User Story Completion Order (Dependency Graph)

- Setup → Foundational → **US1** → **US2** → **US3**
- Setup → Foundational → **US1** → **US4**

### Parallel Opportunities

- Setup: T002, T003, T004, T005, T007, T008 can run in parallel
- Foundational: T010, T011, T013, T018, T020, T022 can run in parallel
- After US1: US2 and US4 phases can proceed in parallel across different files/modules

---

## Parallel Example: User Story 1

```bash
# Parallelizable (different files):
T023 (convex/crewEmails.ts)
T024 (convex/users.ts)
T027 (app/(auth)/login/page.tsx)
T028 (app/(auth)/unauthorized/page.tsx)
```

## Parallel Example: User Story 2

```bash
# Backend mutations/queries can be built in parallel:
T033 (convex/locations.ts)
T034-T037 (convex/inventory.ts)

# UI components can be built in parallel:
T039-T043 (components/inventory/*)
```

## Parallel Example: User Story 3

```bash
# Backend + UI in parallel:
T045-T046 (convex/locationOrders.ts)
T048 (components/locationOrder/EditableOrderCell.tsx)
```

## Parallel Example: User Story 4

```bash
# Backend can be done in parallel:
T053-T056 (convex/notices.ts)

# UI components can be done in parallel:
T058-T060 (components/notice/*)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run through US1 acceptance scenarios in `specs/001-edens-production-mvp/spec.md`

### Incremental Delivery

- Add US2 → validate inventory CRUD + inline editing
- Add US3 → validate ordering reflected in Inventory
- Add US4 → validate notices permissions + search

---

## Notes

- Inventory ordering requirements (per-user) are finalized in US3 by updating `convex/inventory.ts`.
- Locations + crew allowlist seeding is required for any realistic local testing (see `scripts/seed.ts`).
