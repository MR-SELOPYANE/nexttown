-- ============================================================================
-- HITCH SA — DYNAMIC PRICING ENGINE (PERSISTENCE SCAFFOLD)
-- ----------------------------------------------------------------------------
-- Persists the operator-configurable pricing ruleset so fare changes survive
-- across server restarts and are auditable. Until the rule-store is pointed
-- at this table (both read and admin write paths go through the service-role
-- key), edits are kept in the local/in-memory rule store seeded from the
-- curated defaults in src/lib/pricing/config.ts.
--
-- DESIGN NOTES
-- - `pricing_rules` holds ONE live ruleset row (singleton) plus a full history
--   of prior versions so operators can see how / when fares changed.
-- - Server-authoritative, mirroring dispatch: clients may only SELECT the
--   published ruleset (for display / preview); all writes run under the
--   service-role key and are invisible to clients.
-- - `version` is bumped on every write so outstanding signed quotes become
--   invalid the moment rules change (see engine.verifyQuote).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PRICING RULES (singleton live row + immutable history)
-- ---------------------------------------------------------------------------
create table if not exists public.pricing_rules (
  id          uuid primary key default gen_random_uuid(),
  version     integer not null,
  currency    text not null default 'ZAR',
  quote_ttl_ms integer not null default 300000,
  rules       jsonb not null,             -- full PricingRules document
  created_at  timestamptz not null default now(),
  -- Enforce a single LIVE ruleset (version -1 = current) while keeping prior
  -- versions queryable by their own rows.
  is_current  boolean not null default true,
  unique (version)
);

-- Only one row may be marked current at a time (the authoritative ruleset).
create unique index if not exists pricing_rules_singleton_current
  on public.pricing_rules (is_current)
  where is_current = true;

-- ---------------------------------------------------------------------------
-- 2. SEED — curated defaults (values mirror src/lib/pricing/config.ts)
-- ---------------------------------------------------------------------------
insert into public.pricing_rules (version, currency, quote_ttl_ms, is_current, rules)
select
  1,
  'ZAR',
  300000,
  true,
  jsonb_build_object(
    'version', 1,
    'currency', 'ZAR',
    'quoteTtlMs', 300000,
    'defaultVehicleMultiplier', 1,
    'supplyFactor', 0.5,
    'demandCurve', jsonb_build_object('min', 1, 'max', 2.2),
    'applySupply', true,
    'vehicle', jsonb_build_object(
      'hatch', 1, 'sedan', 1, 'suv', 1.15, 'minivan', 1.25, 'minibus', 1.4
    ),
    'tiers', jsonb_build_array(
      jsonb_build_object('id','go','label','NT Go','baseFare',22,'ratePerKm',8.5,'ratePerMin',0.9,'seats',4,'serviceFeeRate',0.12),
      jsonb_build_object('id','comfort','label','NT Comfort','baseFare',30,'ratePerKm',11.5,'ratePerMin',1.2,'seats',4,'serviceFeeRate',0.12),
      jsonb_build_object('id','xl','label','NT XL','baseFare',38,'ratePerKm',14,'ratePerMin',1.5,'seats',6,'serviceFeeRate',0.12)
    ),
    'zones', jsonb_build_array(
      jsonb_build_object('id','neutral','label','Standard','multiplier',1),
      jsonb_build_object('id','airport','label','Airport','multiplier',1.25),
      jsonb_build_object('id','cbd','label','Central business district','multiplier',1.1),
      jsonb_build_object('id','campus','label','Campus','multiplier',1.05),
      jsonb_build_object('id','mall','label','Mall','multiplier',1.05),
      jsonb_build_object('id','high_demand','label','High-demand zone','multiplier',1.3)
    ),
    'timeWindows', jsonb_build_array(
      jsonb_build_object('id','late_night','label','Late night','fromHour',22,'toHour',5,'multiplier',1.2,'days',jsonb_build_array(0,1,2,3,4,5,6)),
      jsonb_build_object('id','morning_peak','label','Morning peak','fromHour',6,'toHour',9,'multiplier',1.1,'days',jsonb_build_array(1,2,3,4,5)),
      jsonb_build_object('id','evening_peak','label','Evening peak','fromHour',16,'toHour',19,'multiplier',1.12,'days',jsonb_build_array(1,2,3,4,5))
    ),
    'events', '[]'::jsonb
  )
on conflict (version) do nothing;

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY — READ-ONLY FOR CLIENTS, WRITES VIA SERVICE ROLE
-- ---------------------------------------------------------------------------
alter table public.pricing_rules enable row level security;

-- Anyone (incl. anon for SSR) may read the current published ruleset.
drop policy if exists "pricing_rules_public_read" on public.pricing_rules;
create policy "pricing_rules_public_read" on public.pricing_rules
  for select to anon, authenticated
  using (is_current = true);

-- No client writes: server writes under the service-role key, which bypasses
-- RLS entirely and is never granted here.

-- ---------------------------------------------------------------------------
-- 4. GRANTS
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.pricing_rules to anon, authenticated;
