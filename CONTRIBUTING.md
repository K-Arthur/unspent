# Contributing to Unspent

Thank you for your interest in contributing to Unspent! This guide will help you get started.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Documentation Guidelines](#documentation-guidelines)
5. [Code Style](#code-style)
6. [Commit Messages](#commit-messages)
7. [Pull Request Process](#pull-request-process)
8. [Testing](#testing)
9. [AI Agent Contributions](#ai-agent-contributions)

---

## Code of Conduct

By participating in this project, you agree to abide by our standards of respectful, inclusive behavior. We are building a deinfluencing app that promotes mindful spending — let's extend that mindfulness to our interactions.

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥18.0.0 | JavaScript runtime |
| pnpm | 10.33.2 | Package manager (monorepo) |
| Supabase CLI | Latest | Local backend development |
| Expo CLI | Latest | Mobile development |
| Vercel CLI | Latest | Web deployment |

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/unspent.git
   cd unspent
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Start Supabase locally:**
   ```bash
   pnpm supabase:start
   # Note the URLs and keys from the output
   # Update .env.local with Supabase values
   ```

5. **Run web app:**
   ```bash
   pnpm dev:web
   # Opens at http://localhost:3000
   ```

6. **Run mobile app:**
   ```bash
   pnpm dev:mobile
   # Follow Expo DevTools instructions for iOS/Android
   ```

---

## Development Workflow

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/dupe-search-ui` |
| Fix | `fix/description` | `fix/vote-count-display` |
| Docs | `docs/description` | `docs/api-reference-update` |
| Refactor | `refactor/description` | `refactor/store-cleanup` |
| A11y | `a11y/description` | `a11y/screen-reader-fixes` |

### Monorepo Structure

```
unspent/
├── apps/
│   ├── mobile/     # Expo mobile app
│   └── web/         # Next.js web app
├── packages/
│   └── shared/     # Shared types, schemas, constants
└── supabase/       # Database + Edge Functions
```

Changes to shared packages require:
1. Update `packages/shared/package.json` version if breaking
2. Run `pnpm -r --if-present typecheck` to verify types
3. Ensure both web and mobile still build

---

## Documentation Guidelines

### ⚠️ Critical: Evidence-Based Documentation

> **Every statement in documentation must be traceable to concrete evidence in the code.**

When updating documentation:

1. **Find the source:** Reference the file and line number
   ```markdown
   > **Source:** `apps/web/package.json:17`
   ```

2. **Verify claims:** Don't trust existing docs — check the code
   - README said Next.js 14+ → checked `package.json` → actual: 15.5.15

3. **Mark unimplemented features:**
   - Use `*Planned*` for features in code but not built
   - Use `❌ Not implemented` for env vars with no code
   - Use `✅ Done` for completed features

4. **Update the changelog:** Add entries to `CHANGELOG.md` under `[Unreleased]`

### Documentation Checklist

- [ ] Claim verified against source code
- [ ] File path + line number included (for key claims)
- [ ] Code examples are runnable (include imports)
- [ ] Tables used for structured data
- [ ] Markdown renders correctly (no broken links)
- [ ] Updated `docs/README.md` if adding new section

---

## Code Style

### TypeScript

- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Use TypeScript types over `any`
- Export types from `packages/shared/src/types/`

### React / React Native

- Functional components with hooks
- Zustand for state management (mobile)
- Server Components by default (Next.js web)
- `"use client"` directive only when needed

### Formatting

- No enforced formatter, but keep consistent with existing code
- Use 2 spaces for indentation
- Maximum line length: 100 characters (soft)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `WishCard.tsx` |
| Files (components) | PascalCase | `WishCard.tsx` |
| Files (utils/hooks) | camelCase | `useAuthStore.ts` |
| Functions | camelCase | `calculateVoteOutcome()` |
| Constants | UPPER_SNAKE_CASE | `MAX_FREE_VOTES_PER_WEEK` |
| Types/Interfaces | PascalCase | `WishlistItem` |
| Database tables | snake_case | `wishlist_items` |
| Env variables | UPPER_SNAKE_CASE | `STRIPE_SECRET_KEY` |

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that neither fixes nor adds feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build process or auxiliary tool changes |

### Examples

```bash
feat(mobile): add vote undo snackbar

fix(web): correct Stripe webhook signature verification

docs: update Edge Functions reference with auth details

refactor(shared): extract vote outcome calculation to pure function
```

### Scopes

| Scope | Description |
|-------|-------------|
| `mobile` | Expo mobile app |
| `web` | Next.js web app |
| `shared` | Shared packages |
| `supabase` | Database migrations or Edge Functions |
| `docs` | Documentation in `/docs` |
| `deps` | Dependency updates |

---

## Pull Request Process

1. **Create a branch** from `main` using naming convention above
2. **Make changes** following code style and documentation guidelines
3. **Test locally:**
   ```bash
   pnpm -r --if-present typecheck
   pnpm -r --if-present lint
   ```
4. **Update documentation** if your changes affect:
   - Environment variables → `docs/configuration/ENVIRONMENT_VARIABLES.md`
   - Database schema → `docs/database/SCHEMA.md`
   - Edge Functions → `docs/api-reference/EDGE_FUNCTIONS.md`
   - Features → `README.md`
5. **Update CHANGELOG.md** with your changes under `[Unreleased]`
6. **Open PR** with:
   - Clear title following commit message format
   - Description of changes
   - Evidence of testing (screenshots, test output)
   - Link to any related issues
7. **PR Review:**
   - At least 1 reviewer approval required
   - All CI checks must pass
   - Documentation must be evidence-based

---

## Testing

### Current Status

> **No automated tests found (as of 2026-05-01).**  
> Add tests when implementing features.

### Planned Test Types

| Type | Tool | Location |
|------|------|----------|
| Unit Tests | Jest / Vitest | `*/__tests__/*.test.ts` |
| Integration Tests | Supabase local | `supabase/tests/` |
| E2E (Web) | Playwright | `apps/web/e2e/` |
| E2E (Mobile) | Detox | `apps/mobile/e2e/` |

### Running Tests (When Available)

```bash
# All tests
pnpm test

# Web tests only
pnpm --filter @unspent/web test

# Mobile tests only
pnpm --filter @unspent/mobile test

# Type checking
pnpm typecheck
```

---

## AI Agent Contributions

If you are an AI agent (LLM, coding assistant) contributing to this project:

### Rules

1. **Never modify code without evidence** — point to file + line
2. **Update documentation** to match your code changes
3. **Follow commit message format** — use `docs:` prefix for doc-only changes
4. **Verify claims** — don't trust existing docs, check the code
5. **Mark uncertainty** — use `*Planned*` or `❌` for unimplemented features

### Documentation-First Approach

When making changes:
1. Read existing documentation
2. Identify gaps or inaccuracies
3. Update documentation FIRST
4. Implement code changes
5. Verify documentation matches reality

### Evidence Format

When making claims in documentation:
```markdown
> **Source:** `path/to/file.ts:123`
> **Last verified:** 2026-05-01
```

### Machine-Readable Docs (Planned)

We plan to add:
- `llms.txt` — Project manifest for LLMs
- OpenAPI spec — Machine-readable API definitions
- JSON-LD structured data — For AI agents

---

## Questions?

- **Documentation issues:** Open an issue with `docs:` prefix
- **Bug reports:** Open an issue with `fix:` prefix
- **Feature requests:** Open an issue with `feat:` prefix

---

**Thank you for contributing to the deinfluencing movement! 🎉**
