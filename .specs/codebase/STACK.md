# Tech Stack

**Analyzed:** 2026-03-15

## Core

- Framework: SvelteKit `^2.50.2` with Svelte `^5.51.0`
- Language: TypeScript `^5.9.3` (strict mode)
- Runtime: Node.js (via Vite/SvelteKit and Effect Node platform)
- Package manager: Bun (lockfile `bun.lock`, repo rule in `AGENTS.md`)
- Build tool: Vite `^7.3.1`
- Deployment adapter: `@sveltejs/adapter-vercel` `^6.3.1`

## Frontend

- UI framework: Svelte 5 runes + SvelteKit routes
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` and `@import 'tailwindcss'` in `src/routes/layout.css`
- State management:
  - Svelte runes (`$state`, `$derived`, `$effect`)
  - Context-based app state for Clerk (`src/lib/stores/clerk.svelte.ts`)
  - Convex real-time cache/subscriptions via `convex-svelte`
- Form handling: native Svelte bindings and HTML forms (no dedicated form library)

## Backend

- API style:
  - Convex functions (`query`, `mutation`, `action`) in `src/convex`
  - SvelteKit remote functions (`query()` from `$app/server`) in `src/lib/remote/demo.remote.ts`
- Database: Convex document database (`convex` `^1.33.0`)
- Auth:
  - Clerk client + backend SDK (`@clerk/clerk-js`, `@clerk/backend`, `@clerk/ui`)
  - Convex auth provider configured through Clerk JWT issuer (`src/convex/auth.config.ts`)
- Backend application logic runtime: Effect v4 beta (`effect`, `@effect/platform-node`)

## Testing

- Unit: none detected
- Integration: none detected
- E2E: none detected
- Type and static validation:
  - `svelte-check` through `bun run check`
  - ESLint + Prettier via `bun run lint`

## External Services

- Database / realtime backend: Convex
- Authentication and user management: Clerk
- Hosting target: Vercel adapter present (no deploy pipeline discovered in repo)

## Development Tools

- Linting: ESLint 9 + `eslint-plugin-svelte` + `typescript-eslint`
- Formatting: Prettier + Svelte and Tailwind plugins
- Type checking: TypeScript strict mode + `svelte-check`
- Local Convex dev orchestration: `convex-vite-plugin` (local backend + site proxy from `vite.config.ts`)
- Convex codegen: `convex codegen` via `bun run convex:gen`
