-- ============================================================================
-- SMART PICKUP ZONES — PHASE 2 SCHEMA
-- ============================================================================
-- Known road-accessible pickup points (gates, entrances, ranks, terminals)
-- maintained by operators and recommended to passengers when their chosen
-- GPS point is inside a known zone (campus, mall, etc.) but NOT at an
-- optimal loading point (entrance, gate, rank).
--
-- Design notes:
-- - center: Zone centroid (the campus/mall/station it serves)
-- - entrance: Exact loading point drivers should aim for
-- - radius: How far passengers roam around `center` before zone stops applying
-- - placeType: Broad category used to explain WHY this is a good pickup
-- - priority: Sort order for ranking recommendations
-- - region: Linked pricing zone or geographic region (e.g. "gauteng")
-- - active: Zone is available for recommendation to passengers
-- ============================================================================

create table if not exists public.pickup_zones (
  id                  text primary key,
  name                text not null,
  center              jsonb not null,  -- { lat: number, lng: number }
  radius_km           numeric(5, 2) not null,
  entrance            jsonb not null,  -- { lat: number, lng: number }
  entrance_full_addr  text,            -- human readable address for drivers
  active              boolean not null default true,
  priority            smallint not null default 50,
  place_type          text not null,   -- 'gate' | 'campus' | 'station' | 'airport' | 'mall' | etc
  description         text,            -- "South gate entrance, 24h security"
  region              text,            -- 'gauteng' | 'kwazulu-natal' | etc
  access_hours        jsonb,           -- { mon_open: "06:00", mon_close: "23:00", ... } (optional)
  amenities           text[],          -- ARRAY['24h_security', 'wheelchair_access', 'covered_waiting']
  visibility_score    smallint default 50,  -- 0-100; affects scoring
  
  -- Traffic/accessibility metadata
  pedestrian_friendly boolean,
  road_accessible boolean default true,
  traffic_restrictions text[] default '{}',
  road_surface        text,            -- 'paved' | 'gravel' | 'mixed'
  parking_available   boolean,
  notes_for_drivers   text,
  
  -- Audit
  created_by          uuid references public.users(id) on delete set null,
  updated_by          uuid references public.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Indexes for geography queries
create index if not exists idx_pickup_zones_active_region 
  on public.pickup_zones(active, region);

create index if not exists idx_pickup_zones_place_type 
  on public.pickup_zones(place_type);

create index if not exists idx_pickup_zones_priority 
  on public.pickup_zones(priority desc);

-- PostGIS index on entrance for spatial queries (optional, advanced)
-- create index if not exists idx_pickup_zones_entrance_geo
--   on public.pickup_zones using gist (st_setsrid(st_makepoint((entrance->>'lng')::float, (entrance->>'lat')::float), 4326));

-- RLS: Allow public read of active zones, admins can read/write all
alter table public.pickup_zones enable row level security;

create policy "public_read_active_zones"
  on public.pickup_zones for select
  using (active = true);

create policy "admin_all_access"
  on public.pickup_zones for all
  to authenticated
  using (
    exists (select 1 from public.user_roles ur 
            where ur.user_id = auth.uid() 
            and ur.role_id = 'admin')
  );

-- Seed the catalogue with South African locations
insert into public.pickup_zones (id, name, center, radius_km, entrance, active, priority, place_type, region, description) 
values
  -- Campuses (Gauteng)
  ('tut-soshanguve-south-main-gate', 'TUT South Campus Main Gate', '{"lat": -25.518, "lng": 28.1}'::jsonb, 2.5, '{"lat": -25.5208, "lng": 28.1032}'::jsonb, true, 90, 'gate', 'gauteng', 'South gate entrance, 24h security post'),
  ('tut-soshanguve-north-gate', 'TUT North Campus Gate', '{"lat": -25.484, "lng": 28.115}'::jsonb, 2.0, '{"lat": -25.4862, "lng": 28.117}'::jsonb, true, 72, 'gate', 'gauteng', 'North campus access road'),
  ('vut-main-gate', 'VUT Main Gate', '{"lat": -26.693, "lng": 27.834}'::jsonb, 2.0, '{"lat": -26.6935, "lng": 27.8338}'::jsonb, true, 60, 'gate', 'gauteng', 'Andries Potgieter entrance'),
  
  -- Campuses (Limpopo)
  ('uvs-main-gate', 'Univen Main Gate', '{"lat": -22.978, "lng": 30.458}'::jsonb, 2.0, '{"lat": -22.979, "lng": 30.457}'::jsonb, true, 60, 'gate', 'limpopo', 'Public entrance, Prinsevani campus'),
  
  -- Transit (Gauteng)
  ('sandton-gautrain', 'Sandton Gautrain Station', '{"lat": -26.108, "lng": 28.056}'::jsonb, 1.6, '{"lat": -26.1086, "lng": 28.0553}'::jsonb, true, 78, 'station', 'gauteng', 'Gautrain station, Maude St drop-off'),
  ('hatfield-gautrain', 'Hatfield Gautrain Station', '{"lat": -25.744, "lng": 28.234}'::jsonb, 1.6, '{"lat": -25.7445, "lng": 28.2338}'::jsonb, true, 74, 'station', 'gauteng', 'Collyer Rd station entrance'),
  ('joburg-park-station', 'Johannesburg Park Station', '{"lat": -26.196, "lng": 28.042}'::jsonb, 1.4, '{"lat": -26.1965, "lng": 28.041}'::jsonb, true, 70, 'bus_terminal', 'gauteng', 'Main concourse taxi & bus interchange'),
  
  -- Airports
  ('ortambo-arrivals', 'OR Tambo Intl · Arrivals', '{"lat": -26.139, "lng": 28.246}'::jsonb, 2.0, '{"lat": -26.1392, "lng": 28.2448}'::jsonb, true, 85, 'airport', 'gauteng', 'Arrivals level, Bay 1 pick-up zone'),
  ('king-shaka-arrivals', 'King Shaka Intl · Arrivals', '{"lat": -29.616, "lng": 31.118}'::jsonb, 2.0, '{"lat": -29.6158, "lng": 31.1176}'::jsonb, true, 80, 'airport', 'kwazulu-natal', 'Arrivals car pick-up lane'),
  
  -- Malls (Gauteng & KZN)
  ('mall-of-africa', 'Mall of Africa', '{"lat": -26.021, "lng": 28.102}'::jsonb, 1.5, '{"lat": -26.0205, "lng": 28.1031}'::jsonb, true, 58, 'mall', 'gauteng', 'Main entrance, Waterfall node'),
  ('menlyn-maine', 'Menlyn Maine', '{"lat": -25.785, "lng": 28.273}'::jsonb, 1.5, '{"lat": -25.7855, "lng": 28.2732}'::jsonb, true, 56, 'mall', 'gauteng', 'Central piazza entrance'),
  ('gateway-theatre', 'Gateway / Theatre', '{"lat": -29.755, "lng": 31.045}'::jsonb, 1.6, '{"lat": -29.7557, "lng": 31.0458}'::jsonb, true, 55, 'mall', 'kwazulu-natal', 'Palm Blvd pick-up zone'),
  
  -- Hospitals
  ('charlotte-maxeke-entrance', 'Charlotte Maxeke Hospital', '{"lat": -26.168, "lng": 28.023}'::jsonb, 1.4, '{"lat": -26.1687, "lng": 28.0233}'::jsonb, true, 62, 'hospital', 'gauteng', 'Joubert St main entrance'),
  
  -- Landmarks
  ('union-buildings-gate', 'Union Buildings · West Gate', '{"lat": -25.743, "lng": 28.209}'::jsonb, 1.4, '{"lat": -25.7438, "lng": 28.2075}'::jsonb, true, 66, 'landmark', 'gauteng', 'Mears St gate, visitors entrance'),
  ('sbic-midrand', 'SBIC Midrand Office Park', '{"lat": -25.984, "lng": 28.139}'::jsonb, 1.2, '{"lat": -25.9845, "lng": 28.1394}'::jsonb, true, 52, 'office_park', 'gauteng', 'Main visitor entrance')
on conflict(id) do nothing;

-- Passenger analytics table (optional, for recommendations tracking)
create table if not exists public.pickup_recommendations_log (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.users(id) on delete set null,
  chosen_location     jsonb not null,  -- { lat, lng }
  recommended_zone_id text references public.pickup_zones(id) on delete set null,
  accepted            boolean,         -- null = user dismissed; true/false = choice
  created_at          timestamptz not null default now()
);

create index if not exists idx_recommendations_log_user_zone
  on public.pickup_recommendations_log(user_id, recommended_zone_id);

alter table public.pickup_recommendations_log enable row level security;

create policy "users_read_own_log"
  on public.pickup_recommendations_log for select
  using (auth.uid() = user_id or auth.uid() is null);

-- ============================================================================
