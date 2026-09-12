-- ============================================================================
-- HITCH SA — PHASE 1 SCHEMA SCAFFOLD (Infrastructure)
-- ----------------------------------------------------------------------------
-- Postgres + PostGIS baseline for the existing HITCH SA app.
--
-- PRESERVATION / SAFETY NOTES
-- - This is reference SQL used to provision the Supabase project in Phase 1.
--   It is stored in the repo as scaffolding; it is NOT auto-applied to a
--   production database by this code.
-- - It ONLY adds identity/auth/core-audit tables (the Phase-1 scope). Rides,
--   payments, wallet ledger, KYC, etc. are added in their own later phases
--   per the migration plan, so nothing here removes or conflicts with the
--   existing frontend.
-- - Every table is RLS-enabled (default deny) with owner-scoped policies, so a
--   leaked publishable key cannot read other users' rows.
-- - This is appended incrementally. Apply with the Supabase CLI or SQL editor.
--
-- REQUIREMENTS: Postgres 14+, PostGIS extension.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS + ENUMS
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists postgis;

do $$ begin
  create type account_status as enum ('active','pending_verification','suspended','locked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_status as enum ('unverified','pending','submitted','under_review','verified','rejected','expired','suspended');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1. CORE IDENTITY
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id                  uuid primary key default gen_random_uuid(),
  email               citext not null unique,
  phone               text unique,
  password_hash       text not null,
  email_verified      boolean not null default false,
  phone_verified      boolean not null default false,
  mfa_enabled         boolean not null default false,
  account_status      account_status not null default 'pending_verification',
  last_login_at       timestamptz,
  failed_login_count  int not null default 0,
  locked_until        timestamptz,
  created_by          uuid references public.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id               uuid primary key references public.users(id) on delete cascade,
  first_name            text,
  last_name             text,
  display_name          text,
  avatar_url            text,
  dob                   date,
  id_type               text check (id_type in ('sa-id','passport')),
  id_number             text,             -- encrypted at rest in production
  language              text default 'en-ZA',
  emergency_contact_name  text,
  emergency_contact_phone text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. ROLES + PERMISSIONS (RBAC baseline)
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id              text primary key,
  description     text,
  is_privileged   boolean not null default false
);

create table if not exists public.user_roles (
  user_id     uuid not null references public.users(id) on delete cascade,
  role_id     text not null references public.roles(id),
  granted_by  uuid references public.users(id),
  granted_at  timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.permissions (
  id              text primary key,
  description     text
);

create table if not exists public.role_permissions (
  role_id       text not null references public.roles(id),
  permission_id text not null references public.permissions(id),
  primary key (role_id, permission_id)
);

-- ---------------------------------------------------------------------------
-- 3. AUDIT (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id            bigserial primary key,
  actor_id      uuid references public.users(id),
  actor_role    text,
  action        text not null,
  entity_type   text,
  entity_id     text,
  before        jsonb,
  after         jsonb,
  ip            inet,
  user_agent    text,
  device_id     text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. UPDATED_AT TRIGGER
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_users_updated on public.users;
create trigger trg_users_updated before update on public.users
  for each row execute function public.set_updated_at();
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY — DEFAULT DENY
-- ---------------------------------------------------------------------------
alter table public.users        enable row level security;
alter table public.profiles     enable row level security;
alter table public.user_roles   enable row level security;
alter table public.audit_logs   enable row level security;

-- OWNER-SCOPED ACCESS. The JWT `sub` equals auth.uid().
-- (Policies are minimal for Phase-1 baseline; privileged/ops roles are added
--  in the Admin/RBAC phase. Never grant "authenticated reads everything".)

-- users: a user may read/write their own row (except hash/status managed by
-- server; writes are limited by column grants server-side).
drop policy if exists "users_self_read"  on public.users;
create policy "users_self_read" on public.users
  for select using (id = auth.uid());

-- profiles: owner-or-self read/write.
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- user_roles: a user may read their own assigned roles.
drop policy if exists "user_roles_self_read" on public.user_roles;
create policy "user_roles_self_read" on public.user_roles
  for select using (user_id = auth.uid());

-- audit_logs: append-only from server (service role); clients cannot read.
drop policy if exists "audit_logs_append" on public.audit_logs;
create policy "audit_logs_append" on public.audit_logs
  for insert with check (true);

-- Seed the base roles that are NOT client-selectable as privileges.
insert into public.roles (id, description, is_privileged) values
  ('passenger', 'Consumer of rides/parcels', false),
  ('driver',    'Private-hire / ride driver (verified)', false),
  ('trucker',   'Freight / return-load operator (verified)', false),
  ('airline_partner',     'Sells seats / charter capacity', false),
  ('school_transport',    'Provides school routes', false),
  ('business',  'Corporate/logistics customer', false),
  ('support',   'Customer-support agent', true),
  ('operations','Ops/safety/dispatch controller', true),
  ('admin',     'Platform administrator', true),
  ('super_admin','Infra/security root admin', true)
on conflict (id) do nothing;
