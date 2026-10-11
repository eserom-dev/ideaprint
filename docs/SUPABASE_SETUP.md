# Supabase Production Deployment & Configuration Guide

**Target Deployment URL:** `https://ideaprintx.vercel.app/`  
**Supabase Project Reference:** `qietlsnyhryfxmaephaw`  
**Supabase Project URL:** `https://qietlsnyhryfxmaephaw.supabase.co`

---

## 1. Authentication & URL Configuration (Critical)

By default, new Supabase projects point to `http://localhost:3000`. If you do not update this, users signing up, logging in via OAuth, or clicking email confirmation links will be redirected to localhost instead of your live Vercel app.

### Steps to Update in Supabase:
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard/project/qietlsnyhryfxmaephaw).
2. In the left navigation menu, click **Authentication** (the user icon) → **URL Configuration**.
3. Under **Site URL**, change the value to:
   ```text
   https://ideaprintx.vercel.app
   ```
4. Under **Redirect URLs**, click **Add URL** and add the following entries:
   ```text
   https://ideaprintx.vercel.app/**
   https://ideaprintx.vercel.app/auth/callback
   https://ideaprintx.vercel.app/reset-password
   https://ideaprintx.vercel.app/dashboard
   http://localhost:3000/**
   ```
   *(Keeping `http://localhost:3000/**` ensures you can still test locally without breaking anything).*
5. Click **Save**.

---

## 2. Auth Provider Settings

### A. Email / Password Authentication
1. Go to **Authentication** → **Providers** → **Email**.
2. **Confirm email**:
   - If you want users to verify their email before using the app, keep **Confirm email** turned **ON**.
   - If you want users to be able to sign in immediately upon registering without waiting for an email, toggle **Confirm email** to **OFF**.
3. **Secure email change**: Recommended **ON**.

### B. Google OAuth (If Enabled)
If you configure Google sign-in:
1. Go to your [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. In your OAuth 2.0 Client ID:
   - **Authorized JavaScript origins**:
     - `https://ideaprintx.vercel.app`
     - `https://qietlsnyhryfxmaephaw.supabase.co`
   - **Authorized redirect URIs**:
     - `https://qietlsnyhryfxmaephaw.supabase.co/auth/v1/callback`
3. Copy your Client ID and Client Secret into **Supabase Dashboard** → **Authentication** → **Providers** → **Google**.

### C. GitHub OAuth (If Enabled)
If you configure GitHub sign-in:
1. In your GitHub account, go to **Settings** → **Developer settings** → **OAuth Apps**.
2. In your OAuth App settings:
   - **Homepage URL**: `https://ideaprintx.vercel.app`
   - **Authorization callback URL**: `https://qietlsnyhryfxmaephaw.supabase.co/auth/v1/callback`
3. Copy your Client ID and Client Secret into **Supabase Dashboard** → **Authentication** → **Providers** → **GitHub**.

---

## 3. Database Schema & Tables Setup

All tables, indexes, triggers, and Row Level Security (RLS) policies are defined in [`supabase/schema.sql`](file:///c:/Users/Eserom%20Demissew/Documents/IdeaPrint/supabase/schema.sql).

### To execute the schema on Supabase:
1. Go to **SQL Editor** in your Supabase Dashboard.
2. Click **New query**.
3. Copy and paste the entire contents of `supabase/schema.sql`.
4. Click **Run** (or `Ctrl+Enter`).

### What this creates:
- **`profiles`**: User profile table auto-synced with `auth.users` via the `handle_new_user` trigger.
- **`projects`**: Core workspace containers with stage tracking (`capture`, `define`, `design`, `plan`, `deliver`).
- **`requirements`**: Functional & non-functional requirements with strict display IDs (`FR-001`).
- **`user_stories`**: Persona-driven user stories (`US-001`).
- **`components`**: System components & responsibilities (`CMP-001`).
- **`entities`**: Data models with JSON field definitions and RLS policy records.
- **`api_endpoints`**: REST API endpoints, HTTP methods, and schemas.
- **`tasks`**: Work breakdown tasks with dependencies and effort ranges.
- **`test_cases`**: Verification test cases with honest status (`not_run`, `passed`, `failed`).
- **`decisions`**: Architecture Decision Records (ADRs).
- **`risks`**: Risk register and mitigation strategies.
- **`activity_events`**: Audit trail events for all project actions.
- **`waitlist_submissions`**: Waitlist capture for Pro and Team upgrades.

---

## 4. Vercel Environment Variables

Ensure your Vercel project at [vercel.com](https://vercel.com/) has the corresponding environment variables set for all environments (**Production**, **Preview**, **Development**):

| Variable Name | Required Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qietlsnyhryfxmaephaw.supabase.co` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Your Supabase Anon Public Key)* | Client-side queries |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your Supabase Service Role Secret Key)* | Server-side admin mutations |
| `GEMINI_API_KEY` | *(Your Gemini API Key)* | Dual AI Blueprint Engine |
| `GROQ_API_KEY` | *(Your Groq API Key)* | High-speed AI inference |

> [!TIP]
> After modifying environment variables in Vercel, remember to trigger a **Redeploy** on Vercel so the new environment variables take effect on the live build.

---

## 5. Row Level Security (RLS) Verification

Every table in IDEAPRINT is protected by RLS using the helper function `has_project_access(project_id)`.
- Users can **only** read and write projects they own (`owner_id = auth.uid()`).
- Unauthenticated users cannot read private blueprints.
- Test in Supabase Table Editor or by signing up with two test accounts to verify data isolation.
