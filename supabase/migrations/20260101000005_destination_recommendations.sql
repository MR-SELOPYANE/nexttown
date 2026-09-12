-- ============================================================================
-- DESTINATION RECOMMENDATIONS — PHASE 2 SCHEMA
-- ============================================================================
-- Tracks passenger destinations and provides learning-based recommendations
-- based on their own legitimate ride history.
--
-- PRIVACY-FIRST DESIGN:
-- - Only stores authenticated user's own data (via auth.uid())
-- - RLS policies enforce user-isolation (users can only see their own)
-- - No cross-user profiling or deterministic assumptions
-- - Users can delete history at any time
-- - Destinations are anonymized (coordinates only, no addresses)
-- - No PII stored beyond lat/lng
-- ============================================================================

-- Rider completed trips (immutable log)
create table if not exists public.ride_destinations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  
  -- Trip endpoints
  pickup_location     jsonb not null,  -- { lat: number, lng: number }
  dropoff_location    jsonb not null,  -- { lat: number, lng: number }
  dropoff_label       text,            -- user-friendly name if available
  
  -- Context (for recommendations)
  completed_at        timestamptz not null,
  day_of_week         text,            -- 'monday' | 'tuesday' | ... (computed from completed_at)
  hour_of_day         smallint,        -- 0-23 (computed from completed_at)
  
  -- Trip context
  vehicle_class       text,            -- 'go' | 'comfort' | 'xl' (from booking)
  trip_distance_km    numeric(7, 2),
  trip_duration_min   integer,
  
  -- Outcome
  rating              smallint,        -- 1-5 (nullable; user may not rate)
  notes               text,            -- optional user notes
  
  created_at          timestamptz not null default now(),
  archived            boolean not null default false  -- soft delete support
);

-- Indexes for recommendation queries
create index if not exists idx_ride_destinations_user_active
  on public.ride_destinations(user_id, archived, completed_at desc)
  where archived = false;

create index if not exists idx_ride_destinations_user_dow_hour
  on public.ride_destinations(user_id, day_of_week, hour_of_day)
  where archived = false;

-- Saved/favourite destinations
create table if not exists public.saved_destinations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  
  -- Destination info
  label               text not null,  -- "Home", "Work", "Gym", etc.
  location            jsonb not null, -- { lat: number, lng: number }
  category            text,           -- "home" | "work" | "school" | "custom"
  
  -- Metadata
  icon_emoji          text,           -- Optional: 🏠 | 💼 | 🎓 | etc.
  color_hex           text,           -- Optional: #FF5733 for UI
  
  -- Usage tracking
  usage_count         integer not null default 0,
  last_used_at        timestamptz,
  
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  
  unique(user_id, label)
);

create index if not exists idx_saved_destinations_user
  on public.saved_destinations(user_id, updated_at desc);

-- Destination recommendation feedback (optional; tracks quality)
create table if not exists public.destination_recommendation_feedback (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  
  -- The recommendation that was shown
  recommended_location jsonb not null,
  recommended_label    text,
  
  -- User feedback
  shown               boolean default true,  -- was it displayed to user?
  clicked             boolean,               -- did user click it?
  used_in_booking     boolean,               -- did they actually book to it?
  
  created_at          timestamptz not null default now()
);

create index if not exists idx_recommendation_feedback_user
  on public.destination_recommendation_feedback(user_id, created_at desc);

-- RLS: Each user can only see their own history
alter table public.ride_destinations enable row level security;
alter table public.saved_destinations enable row level security;
alter table public.destination_recommendation_feedback enable row level security;

create policy "users_read_own_ride_destinations"
  on public.ride_destinations for select
  using (auth.uid() = user_id);

create policy "users_insert_own_ride_destinations"
  on public.ride_destinations for insert
  with check (auth.uid() = user_id);

create policy "users_delete_own_ride_destinations"
  on public.ride_destinations for delete
  using (auth.uid() = user_id);

create policy "users_read_own_saved_destinations"
  on public.saved_destinations for select
  using (auth.uid() = user_id);

create policy "users_insert_own_saved_destinations"
  on public.saved_destinations for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_saved_destinations"
  on public.saved_destinations for update
  using (auth.uid() = user_id);

create policy "users_delete_own_saved_destinations"
  on public.saved_destinations for delete
  using (auth.uid() = user_id);

create policy "users_read_own_feedback"
  on public.destination_recommendation_feedback for select
  using (auth.uid() = user_id);

create policy "users_insert_own_feedback"
  on public.destination_recommendation_feedback for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTION: Log a trip completion (call from booking service)
-- ============================================================================

create or replace function log_ride_completion(
  p_user_id uuid,
  p_pickup_loc jsonb,
  p_dropoff_loc jsonb,
  p_dropoff_label text default null,
  p_distance_km numeric default null,
  p_duration_min integer default null,
  p_vehicle_class text default null,
  p_rating smallint default null
)
returns uuid as $$
declare
  v_trip_id uuid;
  v_completed_at timestamptz := now();
begin
  insert into public.ride_destinations (
    user_id,
    pickup_location,
    dropoff_location,
    dropoff_label,
    completed_at,
    day_of_week,
    hour_of_day,
    trip_distance_km,
    trip_duration_min,
    vehicle_class,
    rating
  ) values (
    p_user_id,
    p_pickup_loc,
    p_dropoff_loc,
    p_dropoff_label,
    v_completed_at,
    to_char(v_completed_at, 'Day')::text,
    extract(hour from v_completed_at at time zone 'Africa/Johannesburg')::smallint,
    p_distance_km,
    p_duration_min,
    p_vehicle_class,
    p_rating
  )
  returning id into v_trip_id;
  
  return v_trip_id;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- HELPER FUNCTION: Get destination recommendations for a user
-- ============================================================================

create or replace function get_destination_recommendations(
  p_user_id uuid,
  p_current_location jsonb default null,
  p_limit integer default 10
)
returns table (
  location jsonb,
  label text,
  frequency_rank integer,
  recency_score numeric,
  time_match_score numeric,
  combined_score numeric,
  source text
) as $$
declare
  v_now_hour integer;
  v_now_dow text;
begin
  v_now_hour := extract(hour from now() at time zone 'Africa/Johannesburg')::integer;
  v_now_dow := to_char(now() at time zone 'Africa/Johannesburg', 'Day')::text;
  
  -- Union of:
  -- 1. Saved destinations (always high priority)
  -- 2. Frequently visited destinations from history
  -- 3. Recent destinations (recency boost)
  -- 4. Time-of-day matching destinations
  
  return query
  select
    -- Saved destinations
    sd.location,
    sd.label,
    1 as frequency_rank,
    0.95::numeric as recency_score,
    1.0::numeric as time_match_score,
    0.95::numeric as combined_score,
    'saved'::text as source
  from public.saved_destinations sd
  where sd.user_id = p_user_id
  order by sd.usage_count desc, sd.last_used_at desc
  limit p_limit
  
  union all
  
  select
    -- Frequent destinations
    rd.dropoff_location,
    rd.dropoff_label,
    row_number() over (order by count(*) desc)::integer,
    (1.0 - (extract(epoch from (now() - max(rd.completed_at))) / (30 * 86400)))::numeric as recency_score,
    case 
      when rd.hour_of_day is not null then (1.0 - (abs(rd.hour_of_day - v_now_hour) / 12.0))::numeric
      else 0.5::numeric
    end as time_match_score,
    (
      (count(*) / nullif((select count(*) from public.ride_destinations where user_id = p_user_id), 0))::numeric * 0.5 +
      (1.0 - (extract(epoch from (now() - max(rd.completed_at))) / (30 * 86400)))::numeric * 0.3 +
      case 
        when rd.hour_of_day is not null then (1.0 - (abs(rd.hour_of_day - v_now_hour) / 12.0))::numeric * 0.2
        else 0.1::numeric
      end
    )::numeric as combined_score,
    'history'::text as source
  from public.ride_destinations rd
  where rd.user_id = p_user_id and rd.archived = false
  group by rd.dropoff_location, rd.dropoff_label, rd.hour_of_day
  having count(*) >= 2
  order by combined_score desc
  limit p_limit;
end;
$$ language plpgsql;

-- ============================================================================
