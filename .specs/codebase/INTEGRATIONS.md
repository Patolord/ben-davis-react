# External Integrations

## Authentication

**Service:** Clerk  
**Purpose:** End-user authentication/session management on client and server  
**Implementation:**  
- Client SDK and UI mounting in `src/lib/stores/clerk.svelte.ts`
- Wrapper-based initialization in `src/lib/wrappers/ClerkWrapper.svelte`
- Server request/session validation in `src/lib/services/clerk.ts`
**Configuration:** `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`  
**Authentication approach:**  
- Browser uses Clerk client session
- Server uses Clerk Backend SDK `authenticateRequest()` + `users.getUser()`

## Database + Realtime Backend

**Service:** Convex  
**Purpose:** Data persistence, reactive subscriptions, backend function execution  
**Implementation:**  
- Schema and functions in `src/convex`
- Browser integration through `convex-svelte` in `src/lib/wrappers/ConvexWrapper.svelte`
- Server-side Convex calls through `ConvexHttpClient` wrapper in `src/lib/services/convex.ts`
**Configuration:** `CONVEX_DEPLOYMENT`, `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`  
**Authentication approach:**  
- Client path: Clerk JWT token attached with `convex.setAuth()`
- Private server path: API key bridge (`CONVEX_PRIVATE_BRIDGE_KEY`) injected server-side

## Local Dev Integration (Convex Local Runtime)

**Service:** `convex-vite-plugin`  
**Purpose:** Run local Convex backend/site proxy during `dev` flow  
**Implementation:** `vite.config.ts` conditionally adds `convexLocal()` when `USE_LOCAL_CONVEX=true`  
**Configuration:**  
- local ports: 3210 (Convex), 3211 (site proxy)
- passes selected env keys into local process (`CONVEX_PRIVATE_BRIDGE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`)

## API Integrations

### Clerk Backend API

**Purpose:** Validate incoming auth and fetch user profile details  
**Location:** `src/lib/services/clerk.ts`  
**Authentication:** secret-key based Clerk backend client  
**Key operations:** `authenticateRequest()`, `users.getUser()`

### Convex HTTP API

**Purpose:** Execute Convex queries/mutations/actions from server-side Effect programs  
**Location:** `src/lib/services/convex.ts`  
**Authentication:** bridge API key passed in args to private Convex wrappers  
**Key operations:** `convex.query()`, `convex.mutation()`, `convex.action()`

## Background Jobs

No scheduler/queue/background job integration found.

## Webhooks

No webhook receiver implementation found.

## Integration Boundaries and Security Model

- Client only calls `authed/*` Convex functions and relies on Clerk-issued JWT.
- SvelteKit server can call:
  - Clerk backend APIs with secret key
  - Convex `private/*` functions via bridge key
- Private bridge key is expected to remain server-only and is validated in `src/convex/private/helpers.ts`.
