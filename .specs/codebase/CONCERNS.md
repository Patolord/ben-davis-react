# Codebase Concerns

**Analysis Date:** 2026-03-15

## Security Considerations

**Cross-user data exposure in conference feature:**

- Risk: authenticated users can currently read and mutate the same shared `conferences` dataset; no per-user ownership checks exist.
- Files: `src/convex/schema.ts`, `src/convex/authed/conferences.ts`
- Current mitigation: auth is required (`authedQuery` / `authedMutation`), so anonymous access is blocked.
- Why this matters: once multiple users exist, one user can list/edit/delete another user's records.
- Recommendations:
  - add ownership fields (for example `userId`) to conference records
  - enforce ownership in list/update/delete handlers
  - add indexes supporting owner-scoped queries

**Bridge key in function args (sensitive boundary to watch):**

- Risk: backend-only bridge auth is implemented by passing `apiKey` into function args; accidental misuse could expose calls or encourage copying this pattern into less safe contexts.
- Files: `src/lib/services/convex.ts`, `src/convex/private/helpers.ts`
- Current mitigation: bridge key is sourced from server env and validated in Convex private wrappers.
- Recommendations:
  - keep all private function references server-only
  - avoid any logging of private args in backend paths
  - consider centralizing guard assertions/tests around private function usage

## Performance Bottlenecks

**Full collection query for conference list:**

- Problem: `list` reads all conference documents via `.collect()` without limit, pagination, or ownership filter.
- Files: `src/convex/authed/conferences.ts`
- Measurement: no production metrics in repo; risk increases linearly with dataset size.
- Cause: unbounded query result and no index-driven filter.
- Improvement path:
  - add indexed filters (for example by owner)
  - move to cursor-based pagination for list views

## Fragile Areas

**Auth and provider boot sequence across wrappers/services:**

- Files: `src/lib/wrappers/ClerkWrapper.svelte`, `src/lib/wrappers/ConvexWrapper.svelte`, `src/lib/stores/clerk.svelte.ts`, `src/lib/services/clerk.ts`
- Why fragile: auth state is coordinated across client wrapper setup, context store emissions, Convex token registration, and separate server-side validation paths.
- Common failures:
  - race conditions during initial load causing unauthenticated UI flashes
  - mismatch between client session assumptions and server-authenticated remote calls
- Safe modification:
  - preserve wrapper order in `src/routes/app/+layout.svelte`
  - validate both client and server auth paths when changing Clerk config or token templates
- Test coverage: no automated tests currently cover this integration path.

## Test Coverage Gaps

**Critical auth/data/error paths untested:**

- What's not tested:
  - Convex auth guards (`authed` and `private`)
  - conference CRUD behavior and data isolation
  - Effect runtime error mapping (`ConvexError`, `ClerkError`, `GenericError`)
- Risk: regressions in security boundaries or HTTP error behavior can ship unnoticed.
- Priority: High
- Files: `src/convex/authed/helpers.ts`, `src/convex/private/helpers.ts`, `src/lib/runtime.ts`, `src/lib/remote/demo.remote.ts`, `src/routes/app/+page.svelte`
- Difficulty to test: medium (requires Clerk/Convex mocking or local integration setup).

## Missing Critical Features

**No tenant/user scoping strategy in persisted data:**

- Problem: current schema and handlers are demo-friendly but not multi-user safe.
- Current workaround: treat app as single-tenant demo.
- Blocks: secure multi-user rollout, predictable user-owned datasets.
- Implementation complexity: medium.
- Files: `src/convex/schema.ts`, `src/convex/authed/conferences.ts`

---

_Concerns audit: 2026-03-15_  
_Update as issues are fixed or new ones discovered_
