-- ============================================================================
-- HITCH SA — DRIVER MATCHING & DISPATCH ENGINE (PERSISTENCE)
-- ----------------------------------------------------------------------------
-- Adds the server-authoritative dispatch state and the driver profile data
-- the 16-factor matcher needs:
--
--   driver_profiles  static quality/work capability data (rating vehicle ...)
--   ride_dispatch    one row per dispatch attempt + lifecycle state
--
-- DESIGN NOTES
-- - Dispatch is SERVER-AUTHORITATIVE: every write path runs under the
--   service-role key, which bypasses Row Level Security. Clients receive no
--   INSERT/UPDATE/GRANT at all; they may only read their own offers.
-- - Double-assignment prevention is enforced at the DATABASE level:
--     * `ride_dispatch_active_driver` — a driver can appear as the current
--       driver of at most ONE active dispatch (offered/accepted/assigned).
--       A second server trying to offer the same driver gets a uniqueness
--       violation and moves to the next candidate.
--     * `ride_dispatch_active_booking` — one active dispatch per booking.
--     * The actual driver grab atomically flips `driver_locations.status`
--       from `available` to `reserved` (UPDATE ... WHERE status='available'),
--       so "first to claim wins" even without the profiles table.
-- - `driver_profiles` mirrors `driver_locations`: ONE row per driver, owner
--   CRUD via `auth.uid()`, default-deny otherwise.
-- - Additive only: no existing object is modified.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. DRIVER PROFILE (static match data per driver)
-- ---------------------------------------------------------------------------
create table if not exists public.driver_profiles (
  driver_id         uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  full_name         text not null default 'Driver',
  phone             text,
  vehicle_class     text not null default 'sedan',
  vehicle_make      text,
  vehicle_model     text,
  vehicle_colour    text,
  plate             text,
  seats             int not null default 4,
  rating            double precision not null default 5,
  acceptance_rate   double precision not null default 1,
  cancellation_rate double precision not null default 0,
  preferred_zone    text,
  ride_types        text[] not null default '{}',
  capabilities      text[] not null default '{}',
  updated_at        timestamptz not null default now(),
  constraint driver_profiles_vehicle_class_ok check (
    vehicle_class in ('hatch','sedan','suv','minivan','minibus')
  ),
  constraint driver_profiles_seats_ok        check (seats > 0),
  constraint driver_profiles_rating_ok       check (rating between 0 and 5),
  constraint driver_profiles_acceptance_ok   check (acceptance_rate between 0 and 1),
  constraint driver_profiles_cancellation_ok check (cancellation_rate between 0 and 1)
);

-- ---------------------------------------------------------------------------
-- 2. DISPATCH STATE (server-authoritative lifecycle)
-- ---------------------------------------------------------------------------
create table if not exists public.ride_dispatch (
  id                uuid primary key default gen_random_uuid(),
  booking_id        text not null,
  passenger_label   text not null,          -- scaffold user id (localStorage-auth apps)
  state             text not null default 'searching',
  offer_sequence    int not null default 0, -- increments each time a new candidate is offered
  candidate_shortlist jsonb not null default '[]', -- ranked [driverId,score,etaMin] list the server replays on rejection
  current_driver_id uuid references auth.users(id) on delete set null,
  pickup_lat        double precision not null,
  pickup_lng        double precision not null,
  dropoff_lat       double precision not null,
  dropoff_lng       double precision not null,
  pickup_label      text not null,
  dropoff_label     text not null,
  vehicle_class     text not null,
  required_seats    int not null,
  ride_type         text not null,
  demand_index      double precision not null default 0.5,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint ride_dispatch_state_ok check (
    state in (
      'searching','offered','accepted',
      'driver_assigned','completed','cancelled','no_driver_available'
    )
  ),
  constraint ride_dispatch_seats_ok       check (required_seats > 0),
  constraint ride_dispatch_demand_range   check (demand_index between 0 and 1),
  constraint ride_dispatch_lat_range      check (
    pickup_lat between -90 and 90 and dropoff_lat between -90 and 90
  ),
  constraint ride_dispatch_lng_range      check (
    pickup_lng between -180 and 180 and dropoff_lng between -180 and 180
  ),
  constraint ride_dispatch_vehicle_class_ok check (
    vehicle_class in ('hatch','sedan','suv','minivan','minibus')
  )
);

-- One active dispatch per booking (idempotency + no double-dispatch).
create unique index if not exists ride_dispatch_active_booking
  on public.ride_dispatch (booking_id)
  where state in ('searching','offered','accepted','driver_assigned');

-- A driver cannot be the current driver of two active dispatches.
create unique index if not exists ride_dispatch_active_driver
  on public.ride_dispatch (current_driver_id)
  where state in ('offered','accepted','driver_assigned');

-- Fast paths for "recent offers per driver" (fairness factor) and driver inbox.
create index if not exists ride_dispatch_driver_lookup
  on public.ride_dispatch (current_driver_id)
  where current_driver_id is not null;

-- ---------------------------------------------------------------------------
-- 3. UPDATED_AT MAINTENANCE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists driver_profiles_touch on public.driver_profiles;
create trigger driver_profiles_touch
  before update on public.driver_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists ride_dispatch_touch on public.ride_dispatch;
create trigger ride_dispatch_touch
  before update on public.ride_dispatch
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY — DEFAULT DENY
-- ---------------------------------------------------------------------------
alter table public.driver_profiles enable row level security;
alter table public.ride_dispatch   enable row level security;

-- A driver manages their OWN profile only.
drop policy if exists "driver_profile_own_insert" on public.driver_profiles;
create policy "driver_profile_own_insert" on public.driver_profiles
  for insert to authenticated
  with check (driver_id = auth.uid());

drop policy if exists "driver_profile_own_update" on public.driver_profiles;
create policy "driver_profile_own_update" on public.driver_profiles
  for update to authenticated
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

drop policy if exists "driver_profile_own_delete" on public.driver_profiles;
create policy "driver_profile_own_delete" on public.driver_profiles
  for delete to authenticated
  using (driver_id = auth.uid());

-- A driver may view their own dispatch offers (server writes the rest).
drop policy if exists "ride_dispatch_driver_select" on public.ride_dispatch;
create policy "ride_dispatch_driver_select" on public.ride_dispatch
  for select to authenticated
  using (current_driver_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 5. GRANTS (server uses the service-role key, which never appears in SQL)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.driver_profiles to authenticated;
grant select on public.ride_dispatch to authenticated;