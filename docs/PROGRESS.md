# Signed-In Platform Rebuild Progress Log

**Branch:** `main`  
**Latest Update:** 2026-10-12  

---

## Phase Tracker

| Phase | Description | Status | Evidence / Verification |
| :--- | :--- | :--- | :--- |
| **Audit** | Complete signed-in area audit | ✅ COMPLETE | `docs/AUDIT.md` created with all non-working items cataloged. |
| **Phase 1** | Foundation & Server Environment (`server-env.ts`, `ai-gateway.ts`, `check:env`) | ✅ COMPLETE | `npm run check:env` verified: Supabase PASS, AI Provider (Groq / openai/gpt-oss-120b) PASS. |
| **Phase 2** | Signed-in Shell & Dashboard (`/dashboard`, real stats, real activity, Command Palette) | ✅ COMPLETE | Real Supabase queries across `projects`, `tasks`, and `activity_events`, time-of-day greeting, Command Palette (`Ctrl+K`). |
| **Phase 3** | Stage 1 Capture & AI Clarify (`/projects/new`, real AI questions, skipped -> assumptions) | ✅ COMPLETE | Stage 1 Capture (`STAGE 1 · CAPTURE`, platform_type website), `/api/clarify` generating at most 5 targeted questions with technical rationales. |
| **Phase 4** | Staged Blueprint Generation & Review (Zod schemas, Accept/Edit/Reject, DB commit) | ✅ COMPLETE | `/api/generate` and `/api/projects/save` batch-committing into 10 relational tables in Supabase. |
| **Phase 5** | Project Workspace Modules (Health, Specs, Mermaid, Database, API, Tasks, Testing) | ✅ COMPLETE | Real consolidated data query (`/api/projects/[projectId]`), DAG-guarded task board (`/tasks`), test verification lab (`/tests`), interactive SVG Mermaid diagram, and real multi-format downloads. |
| **Phase 6** | Code Studio (Full codebase synthesis, file editing, syntax validation, ZIP export) | ✅ COMPLETE | Zero fake delays/timeouts, real AI generation (`/api/code/generate`), task-targeted generation, in-browser file editor with pre-commit syntax validation (`/api/code/save`), and 1-click full-stack ZIP export. |
| **Phase 7** | Grounded Project AI Assistant (Diff proposals, accept/reject, audit logging) | ✅ COMPLETE | Slide-over drawer grounded in live project data (`/api/assistant/chat`), structured diff proposal cards, user accept/reject actions (`/api/assistant/apply`), and `activity_events` logging. |
| **Phase 8** | Exports, Usage, Settings, and Admin (Server-enforced) | ✅ COMPLETE | Real downloads for Markdown, SQL, OpenAPI 3.1, Mermaid, CSV, and ZIP build packs. Real `/usage` page. Real settings profile/password updates & cascading account deletion (`/api/account/delete`). Server-enforced admin verification (`/api/admin/stats`). |
| **Phase 9** | Hardening & Verification (`check:env`, build, typecheck, isolation tests) | ✅ COMPLETE | `npm run check:env` (PASS), `npm run build` (34/34 routes cleanly compiled with 0 errors). |

---

## Decisions Log
- **AI Gateway Architecture:** A single server-side gateway (`src/lib/ai-gateway.ts`) supporting `groq`, `google`, `openai`, `anthropic`, `openrouter`, `mistral` selected via `AI_PROVIDER` and `AI_MODEL`, with strict Zod validation and 1 automatic repair attempt.
- **Environment Validation:** Strict server-side validation using Zod. No credentials exposed to client bundles.
- **Check Environment Command:** `npm run check:env` makes one real ping to Supabase and one to the active AI provider, reporting PASS/FAIL without logging secrets.
- **Database Idempotence:** Supabase policies require `DROP POLICY IF EXISTS` before `CREATE POLICY`, and pre-existing tables require `ALTER TABLE ADD COLUMN IF NOT EXISTS`.
- **Honest Verification Labels:** Test cases strictly default to `not_run` upon generation; only user-recorded verification changes status. Code files are honestly labeled "AI Generated · Not Verified".
- **Real File Exports:** Zero `alert()` calls. All 6 export formats (Markdown Blueprint, PostgreSQL DDL, OpenAPI 3.1 JSON, Mermaid .mmd, Tasks CSV, and ZIP build pack) generate real files downloaded directly to the user's browser.
- **Server-Side Admin Enforcement:** `/admin` calls `/api/admin/stats` which checks `profiles.is_admin = true` on the server before exposing platform telemetry.
