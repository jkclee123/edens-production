# Edens Production Constitution

<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0 (Initial constitution)
Added sections:
  - Code Quality Standards
  - Testing Standards
  - User Experience Consistency
  - Performance Requirements
  - Development Workflow
Templates requiring updates: ⚠ pending (templates to be created/updated in follow-up)
-->

## Core Principles

### I. Code Quality Standards (NON-NEGOTIABLE)

All code MUST adhere to the following quality standards:

- **Readability First**: Code must be self-documenting with clear naming conventions. Complex logic requires inline comments explaining the "why," not the "what."
- **DRY Principle**: Duplication MUST be eliminated through abstraction, shared utilities, or configuration. Exceptions require explicit justification.
- **Single Responsibility**: Each function, class, and module MUST have one clear purpose. Violations must be refactored before merge.
- **Type Safety**: TypeScript/type annotations are mandatory where available. Avoid `any` types; use proper types or `unknown` with type guards.
- **Error Handling**: All error paths MUST be explicitly handled. Silent failures are prohibited. Errors must provide actionable context.
- **Code Review**: All code changes require peer review. Reviewers MUST verify adherence to these principles before approval.
- **Linting & Formatting**: Code MUST pass all configured linters and formatters. Pre-commit hooks enforce this automatically.

**Rationale**: High code quality reduces technical debt, improves maintainability, and accelerates feature development. It is the foundation for all other principles.

### II. Testing Standards (NON-NEGOTIABLE)

Testing is mandatory and follows strict discipline:

- **Test Coverage**: All new code MUST achieve minimum 80% test coverage. Critical paths (authentication, payments, data mutations) require 95%+ coverage.
- **Test-First Development**: TDD is required for all new features: Write tests → Get approval → Watch tests fail → Implement → Refactor.
- **Test Pyramid**: Unit tests form the base (70%), integration tests the middle (20%), and E2E tests the apex (10%). Maintain this distribution.
- **Test Quality**: Tests MUST be independent, deterministic, fast, and clearly named. Flaky tests are treated as production bugs.
- **Test Types Required**:
  - Unit tests for all business logic, utilities, and pure functions
  - Integration tests for API endpoints, database interactions, and service boundaries
  - E2E tests for critical user journeys and happy paths
  - Contract tests for API boundaries and shared schemas
- **Test Maintenance**: Tests MUST be updated when requirements change. Broken tests block deployments.

**Rationale**: Comprehensive testing prevents regressions, enables confident refactoring, and serves as living documentation of system behavior.

### III. User Experience Consistency

User-facing features MUST maintain consistent, predictable experiences:

- **Design System**: All UI components MUST use the established design system. Custom components require design review before implementation.
- **Accessibility**: WCAG 2.1 Level AA compliance is mandatory. All interactive elements must be keyboard navigable and screen-reader friendly.
- **Responsive Design**: All interfaces MUST work seamlessly across mobile, tablet, and desktop viewports. Mobile-first approach preferred.
- **Loading States**: All async operations MUST show clear loading indicators. Skeleton screens preferred over spinners for content areas.
- **Error Messages**: User-facing errors MUST be clear, actionable, and non-technical. Provide recovery paths when possible.
- **Consistent Patterns**: Navigation, forms, buttons, and interactions MUST follow established patterns. New patterns require team approval.
- **Performance Perception**: Perceived performance matters. Use optimistic updates, progressive loading, and smooth animations to enhance UX.

**Rationale**: Consistent UX reduces cognitive load, builds user trust, and improves task completion rates. It reflects product quality and professionalism.

### IV. Performance Requirements

Performance is a feature, not an afterthought:

- **Page Load Performance**: Initial page load MUST complete within 2 seconds on 3G networks. Time to Interactive (TTI) must be under 3 seconds.
- **API Response Times**: 
  - Read operations: p95 < 200ms, p99 < 500ms
  - Write operations: p95 < 500ms, p99 < 1000ms
  - Background jobs: Documented SLA based on job type
- **Bundle Size**: JavaScript bundles MUST be code-split and lazy-loaded. Initial bundle size must not exceed 200KB gzipped.
- **Database Performance**: All queries MUST be optimized. N+1 queries are prohibited. Use database indexes appropriately. Query plans must be reviewed for operations >100ms.
- **Caching Strategy**: Implement appropriate caching layers (browser, CDN, application, database). Cache invalidation strategies MUST be documented.
- **Monitoring**: Performance metrics MUST be monitored in production. Set up alerts for performance degradation. Track Core Web Vitals (LCP, FID, CLS).
- **Scalability**: System design MUST support horizontal scaling. Stateful components must be externalized (e.g., Redis, database).

**Rationale**: Performance directly impacts user satisfaction, conversion rates, and operational costs. Poor performance erodes trust and increases abandonment.

## Development Workflow

### Code Review Process

- All changes require at least one approval from a team member
- Reviewers MUST verify compliance with constitution principles
- Automated checks (tests, linting, type checking) must pass before review
- Review feedback must be addressed or explicitly discussed before merge

### Quality Gates

- Pre-commit hooks enforce linting and formatting
- CI/CD pipeline MUST run full test suite
- Coverage thresholds must be met
- Performance budgets must not be exceeded
- Security scans must pass

### Documentation Requirements

- All public APIs MUST have documentation
- Complex algorithms and business logic require inline documentation
- Architecture decisions must be documented in ADRs (Architecture Decision Records)
- README files must be kept current with setup and deployment instructions

## Governance

This constitution supersedes all other development practices and guidelines. It represents the non-negotiable standards for code quality, testing, user experience, and performance.

**Amendment Process**:
- Proposed amendments require team discussion and consensus
- Amendments must be documented with rationale and migration plans
- Version increments follow semantic versioning:
  - **MAJOR**: Backward-incompatible principle changes or removals
  - **MINOR**: New principles or significant expansions
  - **PATCH**: Clarifications, wording improvements, non-semantic updates

**Compliance**:
- All PRs and code reviews MUST verify constitution compliance
- Violations must be addressed before merge
- Regular audits ensure ongoing adherence
- Exceptions require explicit approval and documentation

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
