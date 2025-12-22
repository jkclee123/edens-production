# Phase 1 Data Model: Eden’s Production MVP (Convex)

This data model is derived from the feature spec requirements (FR-001..FR-030) and user stories.

## Conventions

- **IDs**: Convex document IDs (`Id<"table">`).
- **Timestamps**: ISO-like milliseconds (`number` from `Date.now()`), stored as `createdAt`, `updatedAt`.
- **Soft delete**: `isActive: boolean` (active=true; deleted=false).
- **Email normalization**: `normalizedEmail = lower(trim(email))`.

## Entities

### 1) `crewEmails` (allowlist)

**Purpose**: Authorize access after Google sign-in (FR-006, FR-007).

**Fields**
- `email: string` (original)
- `normalizedEmail: string` (lowercased+trimmed, used for checks)
- `createdAt: number`

**Indexes**
- `by_normalizedEmail` (unique intent; enforce in code)

**Validation**
- `normalizedEmail` must look like an email (basic validation)

---

### 2) `users` (optional app user profile)

**Purpose**: Store display name/image for attribution (updatedBy/creator display).

**Fields**
- `email: string`
- `normalizedEmail: string`
- `name: string`
- `imageUrl?: string`
- `createdAt: number`
- `lastSeenAt: number`

**Indexes**
- `by_normalizedEmail` (unique intent)

**Notes**
- **Creation rule**: Only create/update a `users` row *after* allowlist check succeeds (FR-007).

---

### 3) `locations`

**Purpose**: Inventory grouping and ordering base entity.

**Fields**
- `name: string`
- `createdAt: number`
- `isActive: boolean` (optional for future; default true)

**Indexes**
- `by_name` (unique intent; helpful for stable ordering and admin tooling)

**Validation**
- `name` non-empty trimmed string

---

### 4) `inventory`

**Purpose**: Track inventory items with inline edits (FR-008..FR-021).

**Fields**
- `name: string` (may be empty; spec allows blank name edge case)
- `qty: number` (integer, default 1)
- `locationId?: Id<"locations">` (nullable/undefined means “No location” group)
- `isActive: boolean` (soft delete)
- `updatedAt: number`
- `updatedByUserId: Id<"users">`
- `updatedByName: string` (denormalized for display)
- `updatedByEmail: string` (denormalized for audit/debug)

**Indexes**
- `by_isActive`
- `by_isActive_locationId` (for listing/grouping)

**Search**
- `search_name` (search index on `name`, used for FR-018)

**Validation**
- `qty` integer and \(qty \ge 0\)

**State transitions**
- Create: `name=""`, `qty=1`, `locationId=null`, `isActive=true` (FR-013)
- Delete: set `isActive=false` (FR-017)
- Edit: update relevant field + `updatedAt` + `updatedBy*` (FR-014..FR-016)

---

### 5) `locationOrders`

**Purpose**: Per-user ordering of locations (FR-011, FR-022..FR-025).

**Fields**
- `userId: Id<"users">`
- `locationId: Id<"locations">`
- `order: number` (integer)
- `updatedAt: number`

**Indexes**
- `by_userId_locationId` (unique intent; one row per pair)
- `by_userId` (for retrieving a user’s ordering map)

**Validation**
- `order` integer (can be negative if user wants; allowed unless product disallows)

**Notes**
- Null order is represented by **absence** of a row (FR-023).

---

### 6) `notices`

**Purpose**: Notice board posts (FR-026..FR-029).

**Fields**
- `content: string` (trimmed, non-empty)
- `isActive: boolean` (soft delete)
- `createdAt: number` (spec says `createAt`; we store `createdAt` and map in UI)
- `updatedAt: number`
- `createdByUserId: Id<"users">`
- `createdByName: string` (denormalized)
- `createdByEmail: string` (denormalized)

**Indexes**
- `by_isActive_createdAt` (for newest-first list)
- `by_createdByUserId` (for permission checks / user views)

**Search**
- `search_content` (search index on `content`, used for FR-028)

**Validation**
- `content` must be non-empty after trim

**State transitions**
- Create: `isActive=true`, `createdAt=now`, `updatedAt=now`
- Edit: only creator can edit; update `content` + `updatedAt`
- Delete: only creator can delete; set `isActive=false`

## Access Control Rules (data-level)

All queries/mutations that read/write `inventory`, `locations`, `locationOrders`, `notices` MUST:

1) Require authenticated identity.
2) Verify `identity.email` exists in `crewEmails` (case-insensitive).

This is enforced via a shared server-side helper (e.g., `convex/_auth.ts`).


