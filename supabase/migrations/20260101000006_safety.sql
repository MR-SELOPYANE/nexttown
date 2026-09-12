-- HITCH SA SAFETY: immutable ride events, incidents, and scoped trip shares.

create table if not exists public.ride_events (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null,
  actor_id uuid not null references auth.users(id) on delete restrict,
  rider_id uuid references auth.users(id) on delete set null,
  driver_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ride_events_type check (event_type in (
    'RIDE_REQUESTED','DRIVER_ASSIGNED','DRIVER_ACCEPTED','DRIVER_ARRIVED',
    'TRIP_STARTED','TRIP_COMPLETED','RIDE_CANCELLED','PICKUP_CONFIRMED','SOS_REQUESTED'
  ))
);

create unique index if not exists ride_events_booking_type on public.ride_events(booking_id, event_type);
create index if not exists ride_events_booking_time on public.ride_events(booking_id, occurred_at);

create or replace function public.prevent_ride_event_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'ride events are immutable';
end $$;

drop trigger if exists ride_events_immutable on public.ride_events;
create trigger ride_events_immutable
  before update or delete on public.ride_events
  for each row execute function public.prevent_ride_event_mutation();

create table if not exists public.safety_incidents (
  id uuid primary key default gen_random_uuid(),
  booking_id text,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('sos','suspicious_activity','support_report')),
  message text not null,
  location jsonb,
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.trip_shares (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  share_token text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

alter table public.ride_events enable row level security;
alter table public.safety_incidents enable row level security;
alter table public.trip_shares enable row level security;

create policy "ride_events_participant_read" on public.ride_events for select to authenticated
  using (actor_id = auth.uid() or rider_id = auth.uid() or driver_id = auth.uid());

-- Timeline writes belong to trusted booking/dispatch services, not clients.
create policy "safety_incidents_owner_read" on public.safety_incidents for select to authenticated
  using (reporter_id = auth.uid());
create policy "safety_incidents_owner_insert" on public.safety_incidents for insert to authenticated
  with check (reporter_id = auth.uid());
create policy "safety_incidents_admin_read" on public.safety_incidents for select to authenticated
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role_id = 'admin'
  ));
create policy "trip_shares_owner_read" on public.trip_shares for select to authenticated
  using (owner_id = auth.uid());
create policy "trip_shares_owner_insert" on public.trip_shares for insert to authenticated
  with check (owner_id = auth.uid());
create policy "trip_shares_owner_update" on public.trip_shares for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Events are append-only. No UPDATE or DELETE grants/policies are provided.
grant select on public.ride_events to authenticated;
grant select, insert on public.safety_incidents to authenticated;
grant select, insert, update on public.trip_shares to authenticated;
