# IDEAPRINT — Architectural Decision Log (ADR)

- DEC-001: Selected `gemini-flash-latest` and `openai/gpt-oss-120b` (Groq) as dual production AI engines based on live API availability testing.
- DEC-002: Rebuild home page with R3F 3D Blueprint Graph, background smoke video, glass UI, and no demo prompts or suggestion chips on public landing.
- DEC-003: Protect `/dashboard`, `/projects/new`, and `/projects/[id]` via middleware and client auth state, redirecting to `/sign-in` when unauthenticated.
- DEC-004: All generation runs through server-side multi-pass gateway with Zod schema validation, repair retry, and real-time streaming.
- DEC-005: Pricing plans Pro and Team use real database waitlist submission; Free plan limits are enforced server-side.
- DEC-006: Shipped code contains zero mock projects, zero sample prompts, and zero fake stats; empty states prompt real project creation.
- DEC-007: Vanilla Three.js (`three` + `@types/three`) used with DPR cap at 1.5 for procedural 3D Blueprint Graph to prevent React 18 peer dependency conflicts.
- DEC-008: Replaced sample data dependencies with direct Supabase PostgreSQL persistence and real-time empty states.
- DEC-009: Added `/settings` console (profile, telemetry, plan, account deletion) and server-enforced `/admin` route.
- DEC-010: Completed legal and auth suite (`/privacy`, `/terms`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/not-found`, `/error`) with Google OAuth and security headers middleware.
