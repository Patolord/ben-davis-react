# Architecture

**Pattern:** Modular single-app SvelteKit frontend with split backend access patterns (client-authenticated Convex + server-side private bridge)

## High-Level Structure

```text
Browser (SvelteKit SPA under /app, ssr=false)
  -> ClerkWrapper initializes Clerk client/session
  -> ConvexWrapper wires Clerk token into Convex client auth
  -> UI uses useQuery / client.mutation for reactive data operations
      -> Convex authed functions (src/convex/authed/*)

Browser (or server-rendered route) using remote functions
  -> SvelteKit query() remote function (src/lib/remote/demo.remote.ts)
  -> Effect runtime services
      -> ClerkService (server-side auth validation)
      -> ConvexPrivateService (HTTP client + bridge API key)
  -> Convex private functions (src/convex/private/*)
```

## Identified Patterns

### Wrapper-Based App Composition

**Location:** `src/routes/app/+layout.svelte`, `src/lib/wrappers/*.svelte`  
**Purpose:** Centralize auth and backend client initialization before child routes render  
**Implementation:** App layout nests `ClerkWrapper` and `ConvexWrapper` around route children  
**Example:** `src/routes/app/+layout.svelte`

### Auth-Gated Convex Function Families

**Location:** `src/convex/authed/helpers.ts`, `src/convex/private/helpers.ts`  
**Purpose:** Enforce distinct trust boundaries for client-facing vs backend-only Convex functions  
**Implementation:**
- `authed*` wrappers require `ctx.auth.getUserIdentity()` (Clerk JWT -> Convex auth)
- `private*` wrappers require `apiKey` that matches `CONVEX_PRIVATE_BRIDGE_KEY`
**Example:** `src/convex/private/helpers.ts`

### Effect-Based Service Layer for Server Operations

**Location:** `src/lib/runtime.ts`, `src/lib/services/*.ts`, `src/lib/remote/demo.remote.ts`  
**Purpose:** Typed dependency injection and consistent tagged error handling on server operations  
**Implementation:**
- `ManagedRuntime` composed from `NodeServices`, `ConvexPrivateService`, `ClerkService`
- `effectRunner` maps tagged failures to SvelteKit `error(status, body)`
**Example:** `src/lib/runtime.ts`

### Route-Level Feature Demonstration

**Location:** `src/routes/app/+page.svelte`, `src/routes/app/references/+page.svelte`  
**Purpose:** Keep demo flows visible and executable from UI  
**Implementation:**
- `/app`: conference CRUD with real-time query + authed mutations
- `/app/references`: showcases query/mutation/remote/error patterns in one place
**Example:** `src/routes/app/references/+page.svelte`

## Data Flow

### Flow 1: Client Authed CRUD (Primary App Flow)

1. User authenticates via Clerk UI mounted in `ClerkWrapper`.
2. `ConvexWrapper` registers `convex.setAuth(getClerkAuthToken)`.
3. UI calls `useQuery(api.authed.conferences.list)` and `client.mutation(api.authed.conferences.*)`.
4. Convex `authed*` wrapper verifies user identity in every function call.
5. Convex DB table `conferences` is read/written and reactive updates return to UI.

### Flow 2: Server-to-Convex Private Bridge

1. Svelte route calls remote function (`remoteDemoQuery`).
2. Remote function runs Effect program needing `ConvexPrivateService`.
3. Service injects `CONVEX_PRIVATE_BRIDGE_KEY` into Convex function args.
4. Convex `private*` wrapper validates key before executing function handler.
5. Result returns via `effectRunner` to route caller.

### Flow 3: Server-Side Clerk Validation

1. Remote function (`remoteAuthedDemoQuery`) obtains request with `getRequestEvent()`.
2. `ClerkService.validateAuth()` calls `authenticateRequest()` and `users.getUser()`.
3. On success, reduced user payload returns to UI.
4. On failure, `ClerkError` is mapped to `401` through `effectRunner`.

## Code Organization

**Approach:** Hybrid by runtime boundary and responsibility (routes, UI wrappers/stores, backend services, Convex function domains)

**Structure highlights:**
- `src/routes`: SvelteKit route tree and app pages
- `src/lib/wrappers`: bootstrapping wrappers for auth/data providers
- `src/lib/stores`: client state containers
- `src/lib/services`: server-side integration services (Clerk/Convex)
- `src/lib/remote`: remote function endpoints
- `src/convex/authed`: client-callable Convex API
- `src/convex/private`: backend-only Convex API

**Module boundaries:**
- Browser auth/session and UI logic never directly access private bridge key.
- Server services own secret-backed operations.
- Convex function wrappers enforce access model inside Convex itself.
