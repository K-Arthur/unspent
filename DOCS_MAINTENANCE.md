# Documentation Maintenance Guide

> **Purpose:** Keep Unspent documentation in sync with code  
> **Last updated:** 2026-05-01

This file explains how contributors should maintain documentation as the codebase evolves.

---

## 🚨 Golden Rule: Evidence-Based Documentation

> **Every statement in documentation must be traceable to concrete evidence in the code.**

Before updating any documentation:

1. **Find the source:** Which file implements this feature?
2. **Verify the claim:** Does the code actually do what the docs say?
3. **Note the evidence:** Include file path + line number for key claims.

### Example:

```markdown
The app uses Next.js 15.5.15 for the web frontend.

> **Source:** `apps/web/package.json:17`
> **Last verified:** 2026-05-01
```

---

## 📋 When to Update Documentation

### Must Update (Blocking)

| Change Type | Documentation to Update |
|------------|--------------------------|
| **New API endpoint** | `docs/api-reference/EDGE_FUNCTIONS.md` |
| **New env variable** | `docs/configuration/ENVIRONMENT_VARIABLES.md` |
| **Database schema change** | `docs/database/SCHEMA.md` + migration in `supabase/migrations/` |
| **New dependency** | `package.json` (and README tech stack if user-facing) |
| **Deployement change** | `docs/deployment/*.md` |
| **Version bump** | `CHANGELOG.md` under `[Unreleased]` |

### Should Update (Best Practice)

| Change Type | Documentation |
|------------|---------------|
| **New feature** | `README.md` (mark as ✅ Done or *Planned*) |
| **Config change** | Relevant section in `docs/` |
| **New script** | `README.md` under "Development" section |

---

## 🔧 Documentation Update Workflow

### Step 1: Check Existing Docs

```bash
# Find relevant documentation
ls docs/
cat docs/database/SCHEMA.md
```

### Step 2: Verify Against Code

```bash
# Example: Verify Next.js version claim
grep '"next"' apps/web/package.json

# Example: Verify env var exists in code
grep -r "STRIPE_SECRET_KEY" supabase/functions/
```

### Step 3: Update Documentation

```bash
# Edit the relevant file
vim docs/api-reference/EDGE_FUNCTIONS.md

# Update CHANGELOG
vim CHANGELOG.md  # Add under [Unreleased]
```

### Step 4: Commit with `docs:` Prefix

```bash
git add docs/ CHANGELOG.md
git commit -m "docs: update Edge Functions reference with new auth endpoint"
```

---

## 📖 Documentation Structure

```
docs/
├── README.md              # Docs hub (update if adding new section)
├── api-reference/
│   └── EDGE_FUNCTIONS.md  # Supabase Edge Functions
├── configuration/
│   └── ENVIRONMENT_VARIABLES.md  # All env vars
├── database/
│   └── SCHEMA.md              # DB schema, RLS, functions
└── deployment/
    ├── VERCEL.md             # Next.js web deployment
    ├── EAS.md                # Expo iOS/Android builds
    └── SUPABASE_LOCAL.md     # Local development setup
```

### When Adding New Section:

1. Create the file in appropriate subdirectory
2. Update `docs/README.md` to link to the new file
3. If it's a major section, update the root `README.md` "Documentation" section

---

## 🤖 For AI Agents (LLMs, Coding Assistants)

When contributing to documentation:

### Rules

1. **Never assume** — check the code first
2. **Never invent** features — mark as `*Planned*` if not implemented
3. **Always cite** — include `> **Source:** path:line` for key claims
4. **Update CHANGELOG.md** — add entries under `[Unreleased]`
5. **Test examples** — ensure code snippets are runnable

### Evidence Format for AI-Generated Docs:

```markdown
### Feature Name

Description of what it does.

> **Source:** `path/to/file.ts:123`
> **Last verified:** 2026-05-01
> **Status:** ✅ Implemented | 🟡 Partial | ❌ Planned
```

### Automated Checks (Planned)

```bash
# Check for broken links (planned)
pnpm dlx markdown-link-check docs/**/*.md

# Lint markdown
pnpm dlx markdownlint-cli docs/**/*.md

# Verify code examples compile (planned)
pnpm typecheck
```

---

## 🚯 Common Pitfalls

### ❌ Don't: Trust Existing Documentation

Existing docs may be outdated. Always verify against code.

**Example:** README said Next.js 14+, but `package.json` showed 15.5.15.

### ❌ Don't: Mark Unimplemented Features as Done

Use status markers:
- ✅ = Implemented and verified
- 🟡 = Partial implementation
- ❌ = Not implemented
- *Planned* = In code but not built

### ❌ Don't: Forget the CHANGELOG

Every documentation update must be recorded in `CHANGELOG.md`:

```markdown
## [Unreleased]

### Added
- Documentation: Added Edge Functions reference

### Fixed
- README: Corrected Next.js version (14+ → 15.5.15)
```

---

## 🔗 Key Files Quick Reference

| File | Purpose | Update When... |
|------|---------|---------------|
| `README.md` | Project overview | Features change, tech stack changes |
| `CHANGELOG.md` | Project history | Any significant change |
| `CONTRIBUTING.md` | Contributor guidelines | Process changes |
| `docs/README.md` | Docs hub | Adding new doc section |
| `docs/**/*.md` | Detailed references | Relevant code changes |

---

## ✅ Pre-Commit Checklist

- [ ] Claim verified against source code (file:line referenced)
- [ ] Code examples are runnable (include imports if needed)
- [ ] No broken links (run link checker if available)
- [ ] Markdown renders correctly
- [ ] CHANGELOG.md updated under `[Unreleased]`
- [ ] Commit message has `docs:` prefix
- [ ] Status markers accurate (✅ / 🟡 / ❌ / *Planned*)

---

## 🛠️ Automation (Planned)

### Pre-commit Hook (Planned)

```bash
#!/bin/bash
# .git/hooks/pre-commit (planned)

echo "Checking documentation..."

# Check for broken links
pnpm dlx markdown-link-check docs/**/*.md || exit 1

# Verify env vars mentioned in docs exist in .env.example
grep -r "STRIPE" docs/configuration/ENVIRONMENT_VARIABLES.md
```

### CI Check (Planned)

```yaml
# .github/workflows/docs-check.yml (planned)
name: Docs Check
on: [push, pull_request]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm dlx markdown-link-check docs/**/*.md
      - run: pnpm dlx markdownlint-cli docs/**/*.md
```

---

## 📞 Questions?

- **Documentation issue?** Open an issue with `docs:` prefix
- **Incorrect docs?** Submit PR with evidence (file:line) showing correct info
- **Missing docs?** Open an issue with `docs:` prefix describing what's needed

---

**Made with ❤️ for the deinfluencing generation.**
