# Signed-In Platform Audit (Scope-Locked)

**Audit Date:** 2026-10-11  
**Scope:** Everything after authentication (`/dashboard`, `/projects/new`, `/projects/[id]`, Code Studio, AI Assistant, Exports, Settings, Admin). Public pages and auth flows are strictly preserved.

---

## 1. Summary of Non-Working, Fake, or Demo Items Identified

| Location | Component / Route | Fake / Demo Issue Identified | Required Real Solution |
| :--- | :--- | :--- | :--- |
| **New Project** | `src/app/projects/new/page.tsx` | Hard-coded school questions in clarify step (`Q-01: students and guardians...`). | Real AI call generating 3-5 targeted clarifying questions specifically for the user's idea; skipped questions become assumptions. |
| **New Project** | `src/app/projects/new/page.tsx` | Simulated progress bar with `setInterval` (`p + 10` up to `85%`). | Real streamed Server-Sent Events (SSE) / NDJSON pipeline reporting actual active pass, item counts, and elapsed time. |
| **New Project** | `src/app/projects/new/page.tsx` | No review screen before commit; directly saves or errors. | Interactive Blueprint Review screen allowing builders to inspect, accept, edit, or reject requirements, entities, and tasks before saving. |
| **New Project** | `src/app/projects/new/page.tsx` | Missing Stage 1 Capture exact labels (`STAGE 1 · CAPTURE`, `platform_type: website`). | Enforce exact Stage 1 Capture spec: Project Name & Idea Statement required, platform type always Website. |
| **Dashboard** | `src/app/dashboard/page.tsx` | Stats metrics (tasks done, open tasks, AI usage) were not queried from DB child tables. | Real SQL queries across `projects`, `tasks`, and user profile usage limits. Real empty states with actions. |
| **Dashboard** | `src/app/dashboard/page.tsx` | Activity audit feed was missing; only showed project cards. | Real query against `activity_events` showing actual creations, task mutations, and blueprint exports. |
| **Dashboard** | Global Shell | Missing Command Palette (`Ctrl+K` / `Cmd+K`). | Implement accessible Command Palette with project switching, rapid navigation, and keyboard shortcuts. |
| **API Generate** | `src/app/api/generate/route.ts` | Fallback generated hard-coded "Domain Record Entity" template on error. | Real AI execution with Zod structured output validation, streaming, one repair attempt, and honest error report on key failure. Zero fake fallbacks. |
| **Workspace** | `src/app/projects/[projectId]/page.tsx` | Tasks mutations (Kanban board) only updated React state; did not persist to Supabase `tasks` table. | Real optimistic Supabase mutations on task drag, dependency enforcement, and real task creation. |
| **Workspace** | `src/app/projects/[projectId]/page.tsx` | Test cases verification was not persisted to `test_cases` table in DB. | Real mutation to `test_cases.verification` with honest "Not Run" default until executed by a human. |
| **Workspace** | Architecture Tab | Static diagram or simple list. | Real live Mermaid diagram generation from system components and dependencies. |
| **Workspace** | AI Assistant | Chat was absent or non-functional. | Grounded Project AI Assistant that reads project context and proposes diffs for user acceptance/rejection. |
| **Code Studio** | `src/components/studio/CodeStudio.tsx` | No file editing, no version history, no per-task code generation. | Editable file viewer, syntax check, versions saved to DB, per-task code generation, and full-stack ZIP export. |
| **Exports** | `src/app/projects/[projectId]/page.tsx` | Export tab lacked multi-format downloads. | Real exports for Markdown, JSON, SQL DDL, OpenAPI 3.1 YAML/JSON, Mermaid diagram, CSV, and ZIP. |
| **Admin & Settings**| `src/app/admin/page.tsx` & `/settings` | Admin check was purely client-side; settings lacked CASCADE delete. | Server-side verified `is_admin` check via Supabase RPC/profile, real quota tracking, and secure profile management. |
| **Environment** | Server Env | Missing `npm run check:env` and unified server-side env validator. | Build `src/lib/server-env.ts` and `scripts/check-env.mjs` validating Supabase + selected AI provider without exposing keys. |

---

## 2. Rebuild Execution Plan

- [ ] **Phase 1:** Foundation & Server Environment (`server-env.ts`, `check-env.mjs`, AI Gateway with multi-provider streaming & Zod validation).
- [ ] **Phase 2:** Signed-in Shell & Dashboard (`/dashboard`, real stats, real projects, activity events, empty states, Command Palette).
- [ ] **Phase 3:** Stage 1 Capture & AI Clarify (`/projects/new`, real AI question generation, assumptions, constraints).
- [ ] **Phase 4:** Staged Blueprint Generation & Review (Streaming progress, real pipeline passes, interactive accept/edit/reject review).
- [ ] **Phase 5:** Project Workspace Modules (Overview & Health, Blueprint, Architecture Mermaid, Database SQL, API OpenAPI, Tasks Kanban, Roadmap, Testing Lab, Decisions ADRs, Activity).
- [ ] **Phase 6:** Code Studio (Full codebase synthesis, file editing, version history, per-task code generation, ZIP download).
- [ ] **Phase 7:** Grounded Project AI Assistant (Contextual diff proposal, accept/reject mutations).
- [ ] **Phase 8:** Exports, Usage, Settings, and Server-Enforced Admin.
- [ ] **Phase 9:** Hardening & Verification (`npm run check:env`, `npm run build`, security isolation tests).
