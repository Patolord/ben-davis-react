# Project Structure

**Root:** `c:/dev/ben-davis-react`

## Directory Tree

```text
.
├── src
│   ├── convex
│   │   ├── _generated
│   │   ├── authed
│   │   └── private
│   ├── lib
│   │   ├── components
│   │   ├── remote
│   │   ├── services
│   │   ├── stores
│   │   └── wrappers
│   └── routes
│       ├── app
│       └── layout.css
├── static
├── .vscode
├── .cursor
└── config files (package.json, svelte.config.js, vite.config.ts, eslint.config.js, tsconfig.json)
```

## Module Organization

### Route Layer

**Purpose:** User-facing pages and route-level composition  
**Location:** `src/routes`  
**Key files:** `+layout.svelte`, `+page.svelte`, `app/+layout.svelte`, `app/+page.svelte`, `app/references/+page.svelte`

### Convex Backend

**Purpose:** Database schema and callable backend functions  
**Location:** `src/convex`  
**Key files:** `schema.ts`, `auth.config.ts`, `authed/conferences.ts`, `private/helpers.ts`

### Server Integration Services

**Purpose:** Secret-backed service clients and error/runtime orchestration  
**Location:** `src/lib/services`, `src/lib/runtime.ts`, `src/lib/remote`  
**Key files:** `services/convex.ts`, `services/clerk.ts`, `runtime.ts`, `remote/demo.remote.ts`

### Client Bootstrapping + Shared UI State

**Purpose:** Initialize Clerk/Convex clients and expose context to app pages  
**Location:** `src/lib/wrappers`, `src/lib/stores`  
**Key files:** `ClerkWrapper.svelte`, `ConvexWrapper.svelte`, `clerk.svelte.ts`

## Where Things Live

**Authentication:**
- UI/session initialization: `src/lib/stores/clerk.svelte.ts`
- UI wrapper and user button/sign-in mount: `src/lib/wrappers/ClerkWrapper.svelte`, route pages
- Convex auth provider config: `src/convex/auth.config.ts`
- Server-side request validation: `src/lib/services/clerk.ts`

**Conference CRUD feature:**
- UI: `src/routes/app/+page.svelte`
- Client data access: `src/routes/app/+page.svelte` (`useQuery`, `client.mutation`)
- Convex handlers: `src/convex/authed/conferences.ts`
- Data model: `src/convex/schema.ts`

**Backend private bridge pattern:**
- Remote entrypoint: `src/lib/remote/demo.remote.ts`
- Convex private service client: `src/lib/services/convex.ts`
- Convex guard + private functions: `src/convex/private/helpers.ts`, `src/convex/private/demo.ts`

**Configuration:**
- App/build config: `svelte.config.js`, `vite.config.ts`, `convex.json`
- Tooling config: `eslint.config.js`, `.prettierrc`, `tsconfig.json`
- Environment template: `.env.example`

## Special Directories

**`src/convex/_generated`:**  
**Purpose:** Convex generated API and type files; should be regenerated via `bun run convex:gen`  
**Examples:** `api.d.ts`, `dataModel.d.ts`, `server.d.ts`

**`.cursor/skills/tlc-spec-driven`:**  
**Purpose:** local planning workflow skill references and templates  
**Examples:** `SKILL.md`, `references/brownfield-mapping.md`
