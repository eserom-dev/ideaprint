# IDEAPRINT — Make Ideas Buildable

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-22%20Passing-brightgreen?style=flat)](https://github.com/)

IDEAPRINT is an enterprise-grade AI product engineering platform that turns software ideas into production-ready blueprints, complete with architecture diagrams, relational schemas, REST APIs, dependency-enforced task DAGs, test cases, and synthesizable codebases.

Built around the **Blueprint Noir** design system: obsidian dark backgrounds (`#09090B`), hairline technical grids, frosted glass surfaces, and ember accents (`#FF6B2C`).

---

## Key Capabilities

1. **Stage 1 Capture & AI Clarify**
   - Captures product concept, target audience, platform type, and technical constraints.
   - Generates up to 5 targeted architectural clarifying questions (auth, multi-tenancy, payments, offline support).
   - Skipped questions are logged with transparent default architectural assumptions.

2. **Staged Blueprint Engine**
   - Multi-stage pipeline generating:
     - **Functional & Non-Functional Requirements** with testable Gherkin acceptance criteria.
     - **Normalized PostgreSQL Database Schemas** with primary/foreign keys and Row Level Security (RLS) policies.
     - **REST API Specifications** with path parameters and RFC-compliant JSON responses.
     - **Architecture Decision Records (ADRs)** with context, rejected alternatives, and consequences.
     - **Risk Register** with identified failure modes and mitigations.

3. **Project Workspace**
   - **Overview & Blueprint Health:** Computes completeness score, requirement coverage, and critical path metrics.
   - **Interactive Mermaid Diagram:** Live rendering of system component relationships with zoom and pan controls.
   - **Interactive Task DAG Board:** Kanban board with strict prerequisite dependency blocking (preventing tasks from completing if prerequisites are unfinished).
   - **Testing Lab:** Test cases generated with an honest initial status (`not_run`); only verified runs update test state.
   - **One-Click Real Exports:** Direct browser downloads for Markdown Blueprints, PostgreSQL DDL (`.sql`), OpenAPI 3.1 JSON (`.json`), Mermaid diagrams (`.mmd`), and Tasks CSV (`.csv`).

4. **Code Studio**
   - Synthesizes real, multi-file Next.js 14 App Router and TypeScript implementations per module and per task.
   - Built-in multi-file code viewer and editor with pre-commit syntax validation.
   - Honest labeling: "AI Generated · Not Verified".
   - 1-click full-stack ZIP export bundled via JSZip.

5. **Grounded AI Project Assistant**
   - Context-aware slide-over copilot with full access to project requirements, schema, and tasks.
   - Emits structured diff proposals (e.g. update requirement, add database column) that users can review and apply with 1 click.
   - All assistant actions are audited to `activity_events`.

6. **Enterprise Security & Administration**
   - Strict Row Level Security (RLS) on all Supabase tables ensuring strict multi-tenant isolation.
   - Server-enforced `/admin` platform telemetry route checking `profiles.is_admin = true`.
   - Complete destructive account deletion requiring exact uppercase `DELETE` token.
   - HTTP security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Permissions-Policy`).

---

## Environment Configuration

IDEAPRINT reads all secrets exclusively through `src/lib/server-env.ts`. No API keys or server credentials are ever bundled into client JavaScript.

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Active AI Provider: 'groq' | 'google' | 'openai' | 'anthropic' | 'openrouter' | 'mistral'
AI_PROVIDER=groq
AI_MODEL=openai/gpt-oss-120b

# Provider Specific API Key (Provide the one corresponding to AI_PROVIDER)
GROQ_API_KEY=gsk_...
# GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
# OPENAI_API_KEY=sk-proj-...
# ANTHROPIC_API_KEY=sk-ant-...
# OPENROUTER_API_KEY=sk-or-...
# MISTRAL_API_KEY=...
```

### Validate Environment

Run the automated environment sanity check:

```bash
npm run check:env
```

This performs a live ping to Supabase and a minimal test completion to your active AI provider, verifying connectivity without logging secrets.

---

## Database Setup

Apply the idempotent migration in your Supabase SQL Editor:

```bash
supabase/migrations/20261012_rebuild_signed_in_platform.sql
```

This creates:
- `profiles` with `is_admin` column and auto-provisioning triggers on auth signup.
- 10 project-related relational tables (`projects`, `requirements`, `components`, `entities`, `endpoints`, `tasks`, `test_cases`, `decisions`, `risks`, `code_files`).
- `waitlist_submissions` and `activity_events`.
- Non-destructive Row Level Security (RLS) policies scoped strictly to `auth.uid() = owner_id`.

---

## Development & Testing Commands

```bash
# Install dependencies
npm install

# Run environment sanity check
npm run check:env

# Run automated unit and integration tests (22 tests across 4 suites)
npm test

# Run multi-stage AI pipeline evaluation harness (3 live real-world idea prompts)
npm run eval

# Check TypeScript types
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm run start

# Start development server
npm run dev
```

---

## Test Suites Overview

| Suite | File | Tests | Coverage |
| :--- | :--- | :--- | :--- |
| **Export Generators** | `tests/export-generators.test.ts` | 5 | Markdown, PostgreSQL DDL with RLS, OpenAPI 3.1 JSON, Mermaid .mmd, Tasks CSV |
| **Task DAG Engine** | `tests/dag-validation.test.ts` | 5 | Root tasks, prerequisite dependency blocking, multi-dependency resolution, acyclicity |
| **AI Gateway Schemas** | `tests/ai-schemas.test.ts` | 5 | Clarifying questions, FullBlueprintSchema, CodeFilesSchema, Grounded Copilot proposals |
| **Security & Server Env** | `tests/security-env.test.ts` | 7 | Missing key detection, provider rules, secret leakage prevention, admin RBAC, account delete |

---

## License

Private repository. Copyright © 2026 IDEAPRINT. All rights reserved.
