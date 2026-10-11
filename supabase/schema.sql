-- ========================================================================
-- IDEAPRINT: Complete Production Database Schema & Security Architecture
-- PostgreSQL 15+ / Supabase with Row Level Security (RLS)
-- Version: 2.0 (Blueprint Noir Engine)
-- ========================================================================

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. User Profiles Table (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  is_admin boolean not null default false,
  preferences jsonb default '{"theme": "dark", "effectsTier": "a"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure all columns exist if public.profiles already existed previously
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists preferences jsonb default '{"theme": "dark", "effectsTier": "a"}'::jsonb;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- 3. Projects Container Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  tagline text,
  description text,
  type text not null default 'web_app',
  stage text not null default 'capture' check (stage in ('capture', 'define', 'design', 'plan', 'deliver')),
  status text not null default 'active' check (status in ('active', 'archived')),
  constraints jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Ensure all columns exist if public.projects already existed previously
alter table public.projects add column if not exists tagline text;
alter table public.projects add column if not exists description text;
alter table public.projects add column if not exists type text not null default 'web_app';
alter table public.projects add column if not exists stage text not null default 'capture';
alter table public.projects add column if not exists status text not null default 'active';
alter table public.projects add column if not exists constraints jsonb not null default '{}'::jsonb;
alter table public.projects add column if not exists deleted_at timestamptz;

create index if not exists idx_projects_owner on public.projects (owner_id);
create index if not exists idx_projects_status on public.projects (status) where deleted_at is null;

-- 4. Central Row Level Security Access Function
create or replace function public.has_project_access(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid 
      and p.owner_id = (select auth.uid()) 
      and p.deleted_at is null
  );
$$;

-- 5. Functional & Non-Functional Requirements Table
create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. FR-001, NFR-002
  kind text not null check (kind in ('functional', 'non_functional')),
  statement text not null,
  priority text not null default 'should' check (priority in ('must', 'should', 'could', 'wont')),
  category text not null default 'General',
  rationale text not null,
  acceptance_criteria text[] not null default '{}',
  origin text not null default 'user' check (origin in ('user', 'ai_proposed', 'ai_assumed', 'imported')),
  status text not null default 'proposed' check (status in ('draft', 'proposed', 'accepted', 'rejected', 'superseded')),
  confidence text check (confidence in ('low', 'medium', 'high')),
  confidence_reason text,
  locked boolean not null default false,
  derives_from text[] default '{}',
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, display_id)
);

create index if not exists idx_requirements_project on public.requirements (project_id, status);

-- 6. User Stories Table
create table if not exists public.user_stories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. US-001
  persona text not null,
  statement text not null,
  acceptance_criteria text[] not null default '{}',
  origin text not null default 'ai_proposed',
  status text not null default 'proposed',
  created_at timestamptz not null default now(),
  unique (project_id, display_id)
);

create index if not exists idx_stories_project on public.user_stories (project_id);

-- 7. Architecture Components Table
create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. CMP-001
  name text not null,
  type text not null check (type in ('frontend', 'backend', 'database', 'service', 'gateway', 'worker')),
  technology text not null,
  responsibilities text[] not null default '{}',
  satisfies text[] not null default '{}',
  origin text not null default 'ai_proposed',
  status text not null default 'accepted',
  created_at timestamptz not null default now(),
  unique (project_id, display_id)
);

create index if not exists idx_components_project on public.components (project_id);

-- 8. Database Entities Table
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. ENT-001
  name text not null,
  description text,
  fields jsonb not null default '[]'::jsonb,
  rls_policies text[] not null default '{}',
  origin text not null default 'ai_proposed',
  status text not null default 'accepted',
  created_at timestamptz not null default now(),
  unique (project_id, display_id)
);

create index if not exists idx_entities_project on public.entities (project_id);

-- 9. API Endpoints Table
create table if not exists public.api_endpoints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. API-001
  path text not null,
  method text not null check (method in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  summary text not null,
  auth_required boolean not null default true,
  parameters text[] not null default '{}',
  response_schema text not null,
  satisfies_req text,
  origin text not null default 'ai_proposed',
  status text not null default 'accepted',
  created_at timestamptz not null default now(),
  unique (project_id, display_id)
);

create index if not exists idx_endpoints_project on public.api_endpoints (project_id);

-- 10. Milestones Table
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. MS-01
  title text not null,
  phase text not null,
  due_date text,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'completed')),
  created_at timestamptz not null default now(),
  unique (project_id, display_id)
);

-- 11. Tasks Table (With strict status & dependency references)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. TSK-001
  title text not null,
  description text not null,
  status text not null default 'todo' check (status in ('backlog', 'todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  milestone_id uuid references public.milestones(id) on delete set null,
  effort_min_days numeric(4,1) default 1.0,
  effort_max_days numeric(4,1) default 3.0,
  dependencies text[] not null default '{}',
  implements_req text,
  origin text not null default 'ai_proposed',
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, display_id)
);

create index if not exists idx_tasks_project on public.tasks (project_id, status);

-- 12. Verification & Testing Lab Table
create table if not exists public.test_cases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. TC-001
  category text not null check (category in ('functional', 'security', 'permissions', 'edge', 'accessibility', 'reliability')),
  objective text not null,
  preconditions text not null,
  steps text[] not null default '{}',
  expected_result text not null,
  verifies_req text,
  verification text not null default 'not_run' check (verification in ('not_run', 'passed', 'failed', 'blocked')),
  last_run jsonb,
  origin text not null default 'ai_proposed',
  status text not null default 'accepted',
  created_at timestamptz not null default now(),
  unique (project_id, display_id)
);

create index if not exists idx_tests_project on public.test_cases (project_id, verification);

-- 13. Architecture Decision Records (ADRs) Table
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. DEC-001
  context text not null,
  decision text not null,
  alternatives text[] not null default '{}',
  consequences text not null,
  motivated_by text[] not null default '{}',
  origin text not null default 'user',
  status text not null default 'accepted' check (status in ('proposed', 'accepted', 'superseded')),
  created_at timestamptz not null default now(),
  unique (project_id, display_id)
);

create index if not exists idx_decisions_project on public.decisions (project_id);

-- 14. Risks Register Table
create table if not exists public.risks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  display_id text not null, -- e.g. RSK-001
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  mitigation text not null,
  mitigated_by text,
  created_at timestamptz not null default now(),
  unique (project_id, display_id)
);

-- 15. Activity Audit Log Table
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_project on public.activity_events (project_id, created_at desc);

-- ========================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Deny all by default, allow authenticated owner only
-- ========================================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.requirements enable row level security;
alter table public.user_stories enable row level security;
alter table public.components enable row level security;
alter table public.entities enable row level security;
alter table public.api_endpoints enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.test_cases enable row level security;
alter table public.decisions enable row level security;
alter table public.risks enable row level security;
alter table public.activity_events enable row level security;

-- Profiles: Users can view and edit only their own profile
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Projects: Only project owners can select, insert, update, or delete
drop policy if exists projects_owner on public.projects;
create policy projects_owner on public.projects
  for all using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- All Child Tables: Protected by has_project_access(project_id)
drop policy if exists requirements_policy on public.requirements;
create policy requirements_policy on public.requirements
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists user_stories_policy on public.user_stories;
create policy user_stories_policy on public.user_stories
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists components_policy on public.components;
create policy components_policy on public.components
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists entities_policy on public.entities;
create policy entities_policy on public.entities
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists api_endpoints_policy on public.api_endpoints;
create policy api_endpoints_policy on public.api_endpoints
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists milestones_policy on public.milestones;
create policy milestones_policy on public.milestones
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists tasks_policy on public.tasks;
create policy tasks_policy on public.tasks
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists test_cases_policy on public.test_cases;
create policy test_cases_policy on public.test_cases
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists decisions_policy on public.decisions;
create policy decisions_policy on public.decisions
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists risks_policy on public.risks;
create policy risks_policy on public.risks
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

drop policy if exists activity_events_policy on public.activity_events;
create policy activity_events_policy on public.activity_events
  for all using (has_project_access(project_id))
  with check (has_project_access(project_id));

-- ========================================================================
-- 17. AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up via Supabase Auth, populate public.profiles
-- ========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================================================================
-- 18. WAITLIST SUBMISSIONS TABLE (For Pro & Team Plans)
-- ========================================================================
create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  plan text not null check (plan in ('pro', 'team')),
  created_at timestamptz not null default now()
);

alter table public.waitlist_submissions enable row level security;
drop policy if exists waitlist_insert_policy on public.waitlist_submissions;
create policy waitlist_insert_policy on public.waitlist_submissions
  for insert with check (true);

drop policy if exists waitlist_select_admin_policy on public.waitlist_submissions;
create policy waitlist_select_admin_policy on public.waitlist_submissions
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- Done: Schema successfully declared with Row Level Security.
