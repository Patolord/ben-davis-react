# Code Conventions

## Naming Conventions

**Files:** mostly kebab-case and SvelteKit route conventions  
Examples: `demo.remote.ts`, `clerk.svelte.ts`, `+layout.svelte`, `+page.svelte`, `conferences.ts`

**Functions/Methods:** camelCase verbs and descriptive helper names  
Examples: `getClerkContext`, `setClerkContext`, `remoteAuthedDemoQuery`, `createGenericError`, `handleSubmit`

**Variables:** camelCase for locals; CONSTANT_CASE for selected config constants  
Examples: `clerkContext`, `mutationLoading`, `localConvexPort`, `LOCAL_CONVEX_ENV_KEYS`

**Constants:** UPPER_SNAKE_CASE for env-related/public constants  
Examples: `CONVEX_URL`, `CONVEX_SITE_URL`, `PUBLIC_CLERK_PUBLISHABLE_KEY`

## Code Organization

**Import/dependency declaration:** imports grouped at top; external packages before local aliases/relative imports  
Example pattern in `src/lib/remote/demo.remote.ts`:
- package imports (`effect`, `@sveltejs/kit`)
- local service imports (`$lib/services/*`)
- generated API import (`../../convex/_generated/api`)

**File structure:** declarative setup first, helper functions next, exported handlers last  
Examples:
- `src/lib/services/convex.ts`: types -> error class -> service definition -> returned methods
- `src/routes/app/+page.svelte`: state + handlers in `<script>` then template blocks

## Type Safety / Documentation

**Approach:** strict TypeScript with explicit typing at module boundaries and generated API types where possible  
Examples:
- `strict: true` in root `tsconfig.json`
- Convex generated types (`src/convex/_generated/*`) used by route code
- explicit `Id<'conferences'>` usage in `src/routes/app/+page.svelte`

## Error Handling

**Pattern:** tagged domain errors in server/runtime layer, mapped to structured HTTP errors; client catches imperative calls as needed  
Examples:
- `ConvexError`, `ClerkError`, `GenericError` in `src/lib/runtime.ts` and services
- `effectRunner()` translates failures to `error(status, body)`
- client mutation try/catch in `src/routes/app/references/+page.svelte`

## Comments / Documentation

**Style:** sparse comments; used where a boundary or pattern needs explanation rather than line-by-line narration  
Examples:
- runtime and flow comments in `src/routes/app/references/+page.svelte`
- boundary comments in Convex helper files (`authed` vs `private`)

## Svelte-Specific Patterns

- Components consistently use `<script lang="ts">`
- Svelte 5 runes used broadly (`$state`, `$derived`, `$effect`, `$props`, `$inspect`)
- Async rendering/error boundaries use `<svelte:boundary>` with `pending` and `failed` snippets

## Formatting / Style Tools

- Prettier uses tabs, single quotes, trailingComma `none`, width `100` (`.prettierrc`)
- Tailwind class sorting managed by `prettier-plugin-tailwindcss`
- ESLint baseline combines JS + TS + Svelte recommended configs (`eslint.config.js`)

## Variations / Exceptions Observed

- Line endings vary between some files (both CRLF and LF patterns observed)
- Not all route files include detailed comments; documentation depth is uneven by file
