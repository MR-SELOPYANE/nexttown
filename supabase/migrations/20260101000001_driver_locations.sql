-- ============================================================================
-- HITCH SA — REAL-TIME DRIVER LOCATION TRACKING
-- ----------------------------------------------------------------------------
-- Adds the live driver-location infrastructure:
--
--   driver app ── GPS ──> driver_locations ── Supabase Realtime ──> passenger
--
-- DESIGN NOTES
-- - `driver_id` references `auth.users(id)` (Supabase Auth), NOT the scaffold's
--   custom `public.users`. This is deliberate: Row Level Security authorises a
--   write with `auth.uid()`, so a driver can only ever affect their own row.
-- - The table stores ONE row per driver = the latest fix. Drivers UPSERT their
--   position; Realtime broadcasts every UPDATE to subscribers.
-- - Clients never send a driver id: `driver_id` defaults to `auth.uid()` and
--   every write policy asserts `driver_id = auth.uid()`. A forged id is
--   rejected server-side.
-- - `SELECT` is open to any role for non-offline drivers (passengers track
--   drivers); everything else is default-deny.
-- - Additive only: no existing object is modified, so the Phase-1 scaffold and
--   the current frontend are untouched.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. STATUS ENUM (required set from the spec)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.driver_status as enum (
    'offline',
    'available',
    'reserved',
    'arriving',
    'arrived',
    'on_trip'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 2. LIVE LOCATION TABLE (latest fix per driver)
-- ---------------------------------------------------------------------------
create table if not exists public.driver_locations (
  driver_id   uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  status      public.driver_status not null default 'offline',
  latitude    double precision not null,
  longitude   double precision not null,
  heading     double precision not null default 0,
  speed_kmh   double precision not null default 0,
  accuracy_m  double precision not null default 0,
  device_ts   timestamptz,              -- timestamp from the device GPS fix
  updated_at  timestamptz not null default now(),
  constraint driver_locations_lat_range   check (latitude  between -90  and 90),
  constraint driver_locations_lng_range   check (longitude between -180 and 180),
  constraint driver_locations_accuracy    check (accuracy_m >= 0),
  constraint driver_locations_speed       check (speed_kmh  >= 0),
  constraint driver_locations_heading_ok  check (heading between 0 and 360)
);

-- PostGIS point for proximity search (the "nearby drivers" query).
create extension if not exists postgis;
alter table public.driver_locations
  add column if not exists location geography(point, 4326)
  generated always as (st_makepoint(longitude, latitude)::geography) stored;
create index if not exists driver_locations_geo
  on public.driver_locations using gist (location);

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY — DEFAULT DENY, OWNER-SCOPED WRITES
-- ---------------------------------------------------------------------------
alter table public.driver_locations enable row level security;

-- Passengers (and demo/anon) may see any driver that is not offline.
drop policy if exists "driver_locations_public_read" on public.driver_locations;
create policy "driver_locations_public_read" on public.driver_locations
  for select to anon, authenticated
  using (status <> 'offline');

-- A driver may only ever insert / update / delete their OWN row. The client
-- cannot choose a different driver_id: the column defaults to auth.uid() and
-- the WITH CHECK re-asserts it against the JWT.
drop policy if exists "driver_own_insert" on public.driver_locations;
create policy "driver_own_insert" on public.driver_locations
  for insert to authenticated
  with check (driver_id = auth.uid());

drop policy if exists "driver_own_update" on public.driver_locations;
create policy "driver_own_update" on public.driver_locations
  for update to authenticated
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

drop policy if exists "driver_own_delete" on public.driver_locations;
create policy "driver_own_delete" on public.driver_locations
  for delete to authenticated
  using (driver_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. GRANTS (kept explicit; never grant service-role access to clients)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.driver_locations to anon;
grant select, insert, update, delete on public.driver_locations to authenticated;

-- ---------------------------------------------------------------------------
-- 5. REALTIME PUBLICATION
-- ---------------------------------------------------------------------------
do $$ begin
  if exists (
    select 1 from pg_publication p
    join pg_publication_tables pt on pt.pubname = p.pubname
    where p.pubname = 'supabase_realtime'
      and pt.schemaname = 'public'
      and pt.tablename = 'driver_locations'
  ) then
    return;
  end if;
  alter publication supabase_realtime add table public.driver_locations;
end $$;

-- Broadcast the full row (new + old) so clients can diff positions.
alter table public.driver_locations replica identity full;