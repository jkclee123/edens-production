# Feature Specification: Eden's Production MVP

**Feature Branch**: `001-edens-production-mvp`  
**Created**: 2025-12-22  
**Status**: Draft  
**Input**: User description: "Eden's Production web app MVP (Google login authorization + Inventory + Location Order + Notice)"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Access the app (authorized Google login) (Priority: P1)

As a crew member, I want to log in using Google and only be allowed into the app if my email is on the approved crew list, so the app is restricted to authorized users.

**Why this priority**: Without authorization gating, none of the app content is safe/usable.

**Independent Test**: Can be fully tested by attempting Google login with an approved email vs a non-approved email; delivers controlled access to the product.

**Acceptance Scenarios**:

1. **Given** I am not logged in and my Google account email exists in the CrewEmail list, **When** I choose “Login with Google”, **Then** I am logged in and can access the app’s main navigation (Inventory, Notice).
2. **Given** I am not logged in and my Google account email does not exist in the CrewEmail list, **When** I choose “Login with Google”, **Then** I am not authorized, I cannot access app pages, and no user account is saved/created as a result of this attempt.
3. **Given** I cancel or fail the Google login flow, **When** the flow ends, **Then** I remain logged out and see a clear message indicating login did not complete.

---

### User Story 2 - View and manage inventory in-place (Priority: P2)

As an authorized user, I want to view inventory grouped by location and make edits directly in the table (including adding and deleting items), so inventory stays up to date without extra “save” steps.

**Why this priority**: Inventory is a core operational workflow; in-place editing is a key usability requirement.

**Independent Test**: Can be tested by adding a new inventory row, editing name/qty/location inline, and soft-deleting an item with confirmation.

**Acceptance Scenarios**:

1. **Given** I am on Inventory, **When** the page loads, **Then** I see an inventory table with columns: name, qty, location name, updatedBy, updatedAt, and a delete action.
2. **Given** I am on Inventory, **When** I click the “+” add button, **Then** a new active inventory record is created with name empty, qty 1, location unset, and it appears in the table ready for editing.
3. **Given** an inventory row, **When** I change the name field, **Then** the value is saved immediately without a separate “save changes” action.
4. **Given** an inventory row, **When** I adjust qty using minus/plus controls, **Then** qty changes as an integer and is saved immediately.
5. **Given** an inventory row, **When** I change location using the dropdown, **Then** the location is updated and the row appears under the correct location group.
6. **Given** an active inventory row, **When** I click delete and confirm, **Then** the item is soft-deleted (isActive becomes false) and no longer appears in the active inventory list.

---

### User Story 3 - Personalize location ordering (Priority: P3)

As an authorized user, I want to set my preferred ordering of locations so the inventory groups appear in an order that matches how I work.

**Why this priority**: The spec requires per-user location ordering and a dedicated settings page to manage it.

**Independent Test**: Can be tested by editing a location’s order value and verifying the Inventory page group ordering changes for the same user.

**Acceptance Scenarios**:

1. **Given** I am on Inventory, **When** I click the “Location Order Settings” button, **Then** I navigate to the Location Order Settings page.
2. **Given** I am on Location Order Settings, **When** the page loads, **Then** I see a table of all locations with their order for me; if no order exists for a location, its order cell is empty (null).
3. **Given** a location row with no existing order record for me, **When** I enter an integer order value, **Then** a location order record is created for me and that location.
4. **Given** a location row with an existing order record for me, **When** I change the integer order value, **Then** that location order record is updated immediately without a separate “save changes”.

---

### User Story 4 - Post, search, edit, and delete notices (Priority: P4)

As an authorized user, I want a notice board where I can post updates, search notices by content, and manage my own notices, so information is visible to the crew and stays current.

**Why this priority**: Notices are a primary nav destination and have distinct permission rules.

**Independent Test**: Can be tested by creating a notice, verifying ordering, searching, and confirming only the creator can edit/delete their notice.

**Acceptance Scenarios**:

1. **Given** I am on Notice, **When** notices are shown, **Then** each notice shows the creator’s name and content, ordered by createAt descending (newest first).
2. **Given** I create a notice, **When** I submit content, **Then** the notice appears at the top of the list with my name.
3. **Given** I am viewing notices, **When** I search by free-text content, **Then** only notices matching the query are shown.
4. **Given** a notice I created, **When** I edit it, **Then** the content updates and the notice remains active.
5. **Given** a notice I created, **When** I delete it, **Then** it is soft-deleted (isActive becomes false) and no longer appears in the active notice list.
6. **Given** a notice created by someone else, **When** I view it, **Then** I do not have edit or delete controls for that notice.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Authorized user signs in, but their email casing differs from what is stored (e.g., `Name@Example.com` vs `name@example.com`).
- Authorized user loses login session and tries to access Inventory/Notice directly.
- Inventory qty input is blank, non-integer, or negative.
- Inventory name is blank (allowed) and search/filter behavior with blank names.
- Inventory has no location (null): always appears at the top of the table.
- User deletes an inventory record but cancels the confirmation dialog.
- Two users edit the same inventory item close in time: the table should reflect the latest saved values.
- Location Order: duplicate order values across different locations; ties should still produce a stable, predictable ordering.
- Notice content is empty or only whitespace at creation/edit time.
- Notice search returns no results.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001 (Branding & layout)**: The web app MUST be named “Eden’s Production”.
- **FR-002 (Branding & layout)**: The app MUST use background color `#080808` and accent color `#5D1EDA`.
- **FR-003 (Navigation layout)**: When logged in, the top bar MUST show (from left to right): a “three straight line” menu icon (toggles the left navigation collapse), the app logo centered, and a Settings icon on the top-right.
- **FR-004 (Navigation items)**: The left navigation MUST include Inventory and Notice.

- **FR-005 (Authentication option)**: The only sign-in option presented MUST be “Login with Google”.
- **FR-006 (Authorization gating)**: After a successful Google sign-in, the system MUST check whether the user’s email exists in the CrewEmail table/list.
- **FR-007 (Unauthorized handling)**: If the email does not exist in CrewEmail, the user MUST NOT be authorized to access the app, and the user account MUST NOT be saved/created in the database as a result of the attempt.

- **FR-008 (Inventory list)**: Inventory page MUST display a table of active Inventory records with columns: name, qty, location name, updatedBy, updatedAt, and a delete action.
- **FR-009 (Inventory grouping)**: Inventory table MUST be grouped by location.
- **FR-010 (Inventory ordering - null location)**: Inventory records with no location MUST always appear at the top of the table.
- **FR-011 (Inventory ordering - per-user location order)**: If LocationOrder records exist for the logged-in user, location groups with a defined order MUST be placed above unordered location groups, and smaller order values MUST appear above larger order values.
- **FR-012 (Inventory ordering - when no per-user order)**: If a location has no LocationOrder value for the user, it MUST still appear (and inventory within it must be visible); ordering of unordered locations MUST be stable and predictable.

- **FR-013 (Inventory creation)**: Inventory page MUST provide a “+” action that creates a new Inventory record with: empty name, qty 1, location null, isActive true.
- **FR-014 (Inventory editing)**: Inventory name MUST be an editable string input and MUST persist immediately without requiring a “save changes” action.
- **FR-015 (Inventory qty control)**: Inventory qty MUST be an editable integer input with a minus button on the left and a plus button on the right, and MUST persist immediately without requiring a “save changes” action.
- **FR-016 (Inventory location selection)**: Inventory location MUST be selectable via a dropdown and MUST persist immediately without requiring a “save changes” action.
- **FR-017 (Inventory delete)**: Deleting an Inventory record MUST require confirmation and MUST be a soft delete by setting isActive to false.
- **FR-018 (Inventory search/filter)**: Inventory page MUST provide free text search by Inventory name and a dropdown filter by location.
- **FR-019 (Inventory table scrolling)**: The inventory table MUST NOT force a horizontal scroll bar; it should allow the browser to handle horizontal scrolling behavior.
- **FR-020 (Inventory responsiveness)**: On larger screens, the table MUST fill approximately 90% of the screen; on smaller screens, it MUST be horizontally scrollable.
- **FR-021 (Navigate to location ordering)**: Inventory page MUST provide a button that navigates to the Location Order Settings page.

- **FR-022 (Location Order Settings list)**: Location Order Settings page MUST display a table with columns: location name and order for the logged-in user.
- **FR-023 (LocationOrder row for missing record)**: If a LocationOrder record does not exist for the user and a given location, the table MUST still display a row for that location with a null/empty order value.
- **FR-024 (LocationOrder editing)**: Location order MUST be an editable integer field and MUST persist immediately without requiring a “save changes” action.
- **FR-025 (LocationOrder create-or-update)**: When the user edits a location’s order, the system MUST create a LocationOrder record if none exists for that user+location, otherwise it MUST update the existing record.

- **FR-026 (Notice list)**: Notice page MUST display notices with the creator’s name and content, ordered by createAt descending.
- **FR-027 (Notice permissions)**: Only the notice creator MUST be able to edit and delete that notice.
- **FR-028 (Notice search)**: Notice page MUST provide free text search by notice content.
- **FR-029 (Notice soft delete)**: Deleting a Notice MUST be a soft delete by setting isActive to false.
- **FR-030 (Data accessibility)**: The system MUST support efficient lookup and filtering for: CrewEmail by email, Inventory by name/location/isActive, LocationOrder by user+location, and Notice by createAt/content/isActive.

### Key Entities *(include if feature involves data)*

- **CrewEmail**: Represents the allowlist of authorized crew emails.
  - Key attributes: id, email
  - Relationship/usage: checked after Google sign-in to authorize access

- **Inventory**: Represents an inventory item.
  - Key attributes: id, name (optional), qty (integer, defaults to 1), location (optional), updatedAt, updatedBy (user), isActive (soft delete)
  - Relationships: belongs to an optional Location; updated by a user

- **LocationOrder**: Represents a per-user ordering preference for locations.
  - Key attributes: id, user, location, order (integer)
  - Relationships: links one user and one location; one record per (user, location) pair

- **Location**: Represents a physical or logical place where inventory can be stored.
  - Key attributes: id, name

- **Notice**: Represents a message posted to the notice board.
  - Key attributes: id, user (creator), content, createAt, updatedAt, isActive (soft delete)

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001 (Authorization)**: 100% of login attempts using emails not present in the CrewEmail allowlist are blocked from accessing Inventory/Notice.
- **SC-002 (Primary task completion)**: An authorized user can (a) add an inventory item, (b) set its qty, (c) set its location, and (d) see updatedBy/updatedAt reflect changes—within 2 minutes on first attempt.
- **SC-003 (In-place editing usability)**: At least 90% of test users can successfully edit inventory name and qty without looking for a “save changes” button (because none exists).
- **SC-004 (Notice workflow)**: An authorized user can create a notice and find it via content search in under 60 seconds.
- **SC-005 (Performance at typical scale)**: With up to 1,000 active inventory items and 100 locations, Inventory search and location filtering update results within 1 second for a typical user.
