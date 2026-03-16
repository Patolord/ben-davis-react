# Testing Infrastructure

## Test Frameworks

**Unit/Integration:** none detected in dependencies or file structure  
**E2E:** none detected  
**Coverage:** none detected

## Test Organization

**Location:** no dedicated test directories/files currently present  
**Naming:** no `*.test.*` / `*.spec.*` files found  
**Structure:** quality checks are currently static/type-focused rather than behavior-test-focused

## Testing Patterns

### Unit Tests

**Approach:** not implemented yet  
**Location:** N/A

### Integration Tests

**Approach:** not implemented yet  
**Location:** N/A

### E2E Tests

**Approach:** not implemented yet  
**Location:** N/A

## Current Verification Pipeline

- `bun run check` -> SvelteKit sync + `svelte-check` type validation
- `bun run lint` -> Prettier check + ESLint
- `bun run format` -> Prettier auto-format
- Convex API/type regeneration through `bun run convex:gen`

## Test Execution

**Commands in repo today:**
- `bun run check`
- `bun run lint`
- `bun run format`

**Configuration files affecting quality:**
- `eslint.config.js`
- `.prettierrc`
- `tsconfig.json`
- `src/convex/tsconfig.json`

## Coverage Targets

**Current:** no measured runtime coverage target configured  
**Goals:** not documented in repository  
**Enforcement:** none for test coverage

## Practical Interpretation

This project currently treats static analysis and type checks as the primary safety net. Because the app demonstrates auth/data interactions (Clerk + Convex + Effect), introducing even a small integration/E2E suite would materially reduce regression risk.
