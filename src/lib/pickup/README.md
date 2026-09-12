# SMART PICKUP LOCATION SYSTEM

A comprehensive recommendation engine that identifies better pickup locations for passengers based on GPS coordinates. When a passenger selects a location inside a campus, mall, airport, or other known zone, the system recommends the optimal road-accessible pickup point.

## Overview

A passenger's GPS coordinate is not always the optimal location for a ride pickup. This system:

- **Identifies better pickup points** based on known zones (campuses, airports, malls, stations, etc.)
- **Recommends road-accessible entrances** instead of GPS points inside buildings/secured areas
- **Shows clear explanations** of why a location is recommended ("TUT South Campus Main Gate" instead of GPS coordinates)
- **Respects passenger choice** – users can accept recommendations or keep their original point
- **Enables operator management** – South African locations can be added/edited through an admin panel
- **Tracks analytics** – logs recommendation acceptance for continuous improvement

## Architecture

### Database Schema

**`pickup_zones`** – Stores known pickup points

```sql
CREATE TABLE public.pickup_zones (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  center          jsonb NOT NULL,  -- { lat: number, lng: number }
  radius_km       numeric NOT NULL,
  entrance        jsonb NOT NULL,  -- exact loading point
  active          boolean DEFAULT true,
  priority        smallint DEFAULT 50,
  place_type      text NOT NULL,   -- gate|campus|airport|mall|...
  description     text,
  region          text,             -- gauteng|kwazulu-natal|...
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

**`pickup_recommendations_log`** – Analytics table

```sql
CREATE TABLE public.pickup_recommendations_log (
  id                  uuid PRIMARY KEY,
  user_id             uuid REFERENCES users(id),
  chosen_location     jsonb NOT NULL,
  recommended_zone_id text REFERENCES pickup_zones(id),
  accepted            boolean,          -- null=dismissed, true=accepted, false=rejected
  created_at          timestamptz DEFAULT now()
);
```

### Core Components

#### 1. Recommendation Engine (`src/lib/pickup/recommend.ts`)

Pure, deterministic algorithm that scores zones based on:

- **Distance** from passenger's chosen point to zone entrance
- **Zone type** (airport > campus > mall > landmark)
- **Priority** (operator-set importance ranking)
- **Proximity to capture radius** (how far passengers typically roam)

```typescript
export function scorePickupZone(zone: PickupZone, distanceKm: number): number {
  const typeBonus = TYPE_BONUS[zone.placeType] ?? 0;
  const radial = Math.min(1, Math.max(0, 1 - distanceKm / zone.radius));
  return zone.priority + typeBonus + radial * 10;
}
```

#### 2. Server Functions (`src/lib/dispatch/pickup-zone-functions.ts`)

TanStack React Start server functions exposing the recommendation engine:

```typescript
export const getPickupRecommendationFn = createServerFn({ method: "POST" })
  .validator((data) => ({ location, region }))
  .handler(async ({ data }) => recommendPickup(data.location, zones));
```

Functions:

- `getPickupRecommendationFn` – Fetch recommendations for a location
- `getPickupZonesByRegionFn` – List zones by region
- `upsertPickupZoneFn` – Create/update zones (admin only)
- `deletePickupZoneFn` – Delete/deactivate zones (admin only)
- `logRecommendationFeedbackFn` – Track analytics

#### 3. UI Components

**PickupRecommendationCard** (`src/components/site/pickup-recommendation-card.tsx`)

Non-blocking modal showing recommendations with:

- Top-ranked alternative pickup point
- Distance and type badge
- Accept/reject/dismiss buttons
- Automatic analytics logging

**PickupZonesAdminPanel** (`src/components/site/pickup-zones-admin-panel.tsx`)

Management interface for operators:

- Create new zones
- Edit existing zones
- Filter by region
- Toggle active/inactive
- Map-friendly coordinates

#### 4. React Hooks

**usePickupRecommendation** (`src/lib/hooks/use-pickup-recommendation.ts`)

```typescript
const { recommendation, isLoading } = usePickupRecommendation(location, { region: "gauteng" });
```

**usePickupWithRecommendation** (`src/lib/hooks/use-pickup-with-recommendation.ts`)

High-level hook with callback management:

```typescript
const pickup = usePickupWithRecommendation(geocodedFrom, {
  region: "gauteng",
  onAcceptRecommendation: (zone) => {
    setGeocodedFrom(zone.zone.entrance);
  },
});
```

## Installation & Setup

### 1. Database Migration

Run the Supabase migration:

```bash
supabase migration up
```

This creates:

- `pickup_zones` table with seeded South African locations
- `pickup_recommendations_log` table for analytics
- RLS policies for security
- Performance indexes

### 2. Register Server Functions

The pickup zone functions are automatically registered when you import the dispatch module:

```typescript
// src/start.ts
import "./lib/dispatch/dispatch-server"; // Already done
```

### 3. Add to Your App

#### In a booking/ride flow:

```typescript
import { PickupRecommendationCard } from "@/components/site/pickup-recommendation-card";
import { usePickupRecommendation } from "@/lib/hooks/use-pickup-recommendation";

export function RideFlow() {
  const [geocodedFrom, setGeocodedFrom] = useState<LatLng | null>(null);
  const { recommendation } = usePickupRecommendation(geocodedFrom, { region: "gauteng" });

  return (
    <>
      {/* Map & location picker */}

      {/* Recommendation card */}
      <PickupRecommendationCard
        location={geocodedFrom}
        onAccept={(zone) => {
          setGeocodedFrom(zone.zone.entrance);
        }}
        onReject={(location) => {
          // Keep original location
        }}
      />
    </>
  );
}
```

#### In admin panel (/admin):

```typescript
import { PickupZonesAdminPanel } from "@/components/site/pickup-zones-admin-panel";

export default function AdminPage() {
  return <PickupZonesAdminPanel />;
}
```

## Seeded Locations

The system ships with curated South African locations:

### Campuses

- **TUT Soshanguve** – South & North gates (Gauteng)
- **Univen** – Main gate (Limpopo)
- **VUT** – Main gate (Gauteng)

### Airports

- **OR Tambo International** – Arrivals level (Gauteng)
- **King Shaka International** – Arrivals (KwaZulu-Natal)

### Transit

- **Sandton Gautrain Station** (Gauteng)
- **Hatfield Gautrain Station** (Gauteng)
- **Johannesburg Park Station** (Gauteng)

### Malls

- **Mall of Africa** (Gauteng)
- **Menlyn Maine** (Gauteng)
- **Gateway Theatre** (KwaZulu-Natal)

### Healthcare

- **Charlotte Maxeke Hospital** (Gauteng)

### Landmarks

- **Union Buildings** (Gauteng)
- **SBIC Midrand Office Park** (Gauteng)

All locations are configurable through the admin panel.

## Configuration

### Recommendation Scoring

Customize scoring in `src/lib/pickup/recommend.ts`:

```typescript
// How far around passenger's point we search
export const captureRadiusKm = 8;

// If already at entrance, don't suggest
export const entranceToleranceKm = 0.08; // 80m

// Minimum quality score to recommend
export const minRecommendedScore = 12;

// Bonuses per place type
const TYPE_BONUS = {
  gate: 8,
  campus: 12,
  airport: 14, // ← customize here
  mall: 6,
  // ...
};
```

### Place Types

Supported zone types:

- `gate` – Entrance/security gate
- `campus` – University/college grounds
- `station` – Train/transit station
- `airport` – Commercial airport
- `mall` – Shopping mall
- `hospital` – Medical facility
- `taxi_rank` – Taxi rank/queue
- `bus_terminal` – Bus terminal
- `office_park` – Office complex
- `landmark` – Major landmark

### Regions

Supported South African provinces:

- `gauteng`
- `kwazulu-natal`
- `western-cape`
- `limpopo`
- `eastern-cape`
- `northern-cape`
- `free-state`
- `mpumalanga`
- `north-west`

## Analytics

Track recommendation effectiveness:

```sql
SELECT
  recommended_zone_id,
  COUNT(*) as total_recommendations,
  SUM(CASE WHEN accepted = true THEN 1 ELSE 0 END) as accepted,
  ROUND(100.0 * SUM(CASE WHEN accepted = true THEN 1 ELSE 0 END) / COUNT(*), 1) as acceptance_rate
FROM public.pickup_recommendations_log
WHERE created_at > now() - interval '7 days'
GROUP BY recommended_zone_id
ORDER BY total_recommendations DESC;
```

This reveals:

- Which zones are most frequently recommended
- Acceptance rates (high = good recommendation)
- Zones needing adjustment (low acceptance = too intrusive)

## Type Definitions

```typescript
// Core types in src/lib/pickup/types.ts

type PickupZone = {
  id: string;
  name: string;
  center: LatLng; // Zone centroid
  radius: number; // Capture radius in km
  entrance: LatLng; // Exact loading point
  active: boolean;
  priority: number; // Sort order (higher = first)
  placeType?: PickupPlaceType;
  description?: string;
  region?: string;
};

type PickupRecommendation = {
  origin: LatLng;
  originLabel?: string;
  zones: RankedPickupZone[]; // Best zones first
  hasSuggestion: boolean;
};

type RankedPickupZone = {
  zone: PickupZone;
  score: number; // Quality score
  distanceKm: number; // Distance to entrance
  description: string; // Human explanation
  reason: PickupRecommendationReason; // Why suggested
};
```

## API Reference

### getPickupRecommendationFn

Fetch recommendations for a location.

```typescript
const recommendation = await getPickupRecommendationFn({
  location: { lat: -25.518, lng: 28.1 },
  locationLabel: "TUT Campus",
  region: "gauteng"  // optional
});

// Returns:
{
  origin: { lat: -25.518, lng: 28.1 },
  originLabel: "TUT Campus",
  zones: [
    {
      zone: { id: "tut-sosh-south", name: "TUT South Campus Main Gate", ... },
      score: 98.5,
      distanceKm: 0.42,
      description: "South gate entrance, 24h security · 420m from your point",
      reason: "nearby_known_zone"
    }
  ],
  hasSuggestion: true
}
```

### upsertPickupZoneFn

Create or update a pickup zone (admin only).

```typescript
const result = await upsertPickupZoneFn({
  id: "tut-main-gate",
  name: "TUT Main Gate",
  center: { lat: -25.518, lng: 28.1 },
  entrance: { lat: -25.5208, lng: 28.1032 },
  radius: 2.5,
  active: true,
  priority: 90,
  placeType: "gate",
  region: "gauteng",
  description: "South gate entrance, 24h security"
});

// Returns:
{ ok: true, message: "Zone saved successfully", zone: { ... } }
```

### deletePickupZoneFn

Delete or deactivate a zone (admin only).

```typescript
const result = await deletePickupZoneFn({
  id: "tut-main-gate",
  hard: false  // true = hard delete, false = soft (set inactive)
});

// Returns:
{ ok: true, message: "Zone deleted successfully" }
```

### logRecommendationFeedbackFn

Log user feedback for analytics.

```typescript
await logRecommendationFeedbackFn({
  chosenLocation: { lat: -25.518, lng: 28.1 },
  recommendedZoneId: "tut-main-gate",
  accepted: true, // true = accepted, false = rejected, null = dismissed
});
```

## Testing

Run unit tests:

```bash
npm run test
```

Test files:

- `src/lib/pickup/__tests__/recommend.test.ts` – Scoring & ranking logic
- `src/lib/pickup/__tests__/pickup-zone-service.test.ts` – Zone catalogue
- `src/lib/pickup/__tests__/server-functions.test.ts` – Server functions
- `src/lib/pickup/__tests__/ui-hooks.test.ts` – React hooks

Tests cover:

- Scoring algorithm correctness
- Recommendation ranking
- Edge cases (no zones, already at entrance, far away)
- Data validation
- Analytics logging

## Performance

- **Recommendation latency**: <50ms (pure logic) + network round-trip
- **Cache TTL**: 5 minutes per location
- **Database indexes**: On `active`, `region`, `priority`, `place_type`
- **RLS overhead**: Minimal (single row-level policy per query)
- **Capacity**: Handles 1000+ zones efficiently

## Security

- Zone data is public (read-only for non-admins via RLS)
- Admin operations require `admin` role
- User feedback logs auth.uid()
- Passenger GPS never persisted (transient per recommendation)
- All coordinates validated to South Africa bounds

## File Structure

```
src/
├── lib/
│   ├── pickup/
│   │   ├── types.ts                        # Core type definitions
│   │   ├── recommend.ts                    # Scoring engine
│   │   ├── pickup-zone-service.ts          # Zone catalogue
│   │   ├── INTEGRATION.md                  # Integration guide
│   │   └── __tests__/
│   │       ├── recommend.test.ts
│   │       ├── pickup-zone-service.test.ts
│   │       ├── server-functions.test.ts
│   │       └── ui-hooks.test.ts
│   ├── hooks/
│   │   ├── use-pickup-recommendation.ts    # Fetch recommendations
│   │   └── use-pickup-with-recommendation.ts # High-level hook
│   └── dispatch/
│       ├── pickup-zone-functions.ts        # Server functions
│       └── server/
│           └── pickup-zone-service.ts      # DB operations
├── components/
│   └── site/
│       ├── pickup-recommendation-card.tsx  # UI component
│       └── pickup-zones-admin-panel.tsx    # Admin interface
└── supabase/
    └── migrations/
        └── 20260101000004_pickup_zones.sql # DB schema
```

## Future Enhancements

- **Map visualization** – Show zones on map with boundaries
- **Predictive scoring** – ML model to predict acceptance rates
- **Time-based access** – Hours of operation per zone
- **Accessibility info** – Wheelchair access, covered waiting areas
- **Real-time updates** – WebSocket for live zone availability
- **Mobile app** – Native iOS/Android support
- **Internationalization** – Expand beyond South Africa

## Support

For issues or questions:

1. Check [INTEGRATION.md](./INTEGRATION.md) for implementation details
2. Review test files for usage examples
3. Check database schema in migrations

## License

Part of the HITCH SA platform. All rights reserved.
