# Destination Recommendations — System Documentation

## Overview

The Destination Recommendations system provides intelligent, privacy-first destination suggestions based on a user's own trip history and saved places. It learns from legitimate ride patterns, factors in time-of-day context, and empowers users to understand and control their data.

### Key Features

- **Learned Recommendations**: Analyzes user's ride history (pickup/dropoff patterns, frequency, recency)
- **Saved Destinations**: Users can explicitly save favorites (Home, Work, etc.) with custom labels
- **Time-of-Day Context**: Suggests destinations based on historical patterns at specific hours
- **Privacy-First Design**: All data is per-user, enforced at database level (RLS), never shared across users
- **Soft Deletion**: Users can archive or delete history without permanent data loss
- **Explainable Scoring**: Transparent algorithm showing frequency, recency, and time-match factors
- **Feedback Tracking**: Analytics to improve recommendation quality over time

---

## Architecture

### Data Flow

```
User Completes Booking
  ↓
logRideDestinationFn() called
  ↓
Backend: log_ride_completion() stored in Supabase
  ↓
User Opens Booking Screen
  ↓
getDestinationRecommendationsFn() called
  ↓
Backend: Fetches ride_destinations + saved_destinations
  ↓
Backend: Calls get_destination_recommendations() PL/pgSQL helper
  ↓
Frontend: rankDestinationRecommendations() scores and ranks results
  ↓
UI: DestinationSuggestionsPanel displays top recommendations
  ↓
User Selects Destination
  ↓
recordSavedDestinationUsage() updates usage_count
  ↓
logRecommendationFeedbackFn() logs analytics
```

### Database Schema

#### `ride_destinations` (Trip History)

Immutable log of completed trips. Created once, soft-deleted only.

```sql
CREATE TABLE ride_destinations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pickup_location JSONB NOT NULL,       -- { lat: number, lng: number }
  dropoff_location JSONB NOT NULL,      -- { lat: number, lng: number }
  dropoff_label TEXT,                   -- e.g. "Mall of Africa" (optional)
  completed_at TIMESTAMPTZ NOT NULL,
  day_of_week TEXT,                     -- "Monday", "Tuesday", etc.
  hour_of_day SMALLINT,                 -- 0-23 (time of day context)
  vehicle_class TEXT,                   -- "economy", "premium", etc.
  trip_distance_km NUMERIC,
  trip_duration_min INT,
  rating INT (1-5),                     -- User satisfaction
  notes TEXT,
  archived BOOLEAN DEFAULT false,       -- Soft delete
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX ON ride_destinations (user_id, archived, completed_at DESC);
CREATE INDEX ON ride_destinations (user_id, day_of_week, hour_of_day);
```

#### `saved_destinations` (Explicit Favorites)

User-curated list of favorite locations (Home, Work, etc.).

```sql
CREATE TABLE saved_destinations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  label TEXT NOT NULL,                  -- "Home", "Work", etc.
  location JSONB NOT NULL,              -- { lat: number, lng: number }
  category TEXT,                        -- "home" | "work" | "school" | "custom"
  icon_emoji TEXT,                      -- "🏠" for UI display
  color_hex TEXT,                       -- "#FF5733" for UI display
  usage_count INT DEFAULT 0,            -- Frequency tracking
  last_used_at TIMESTAMPTZ,             -- Recency tracking
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, label)
);

-- Index for quick fetch
CREATE INDEX ON saved_destinations (user_id, usage_count DESC);
```

#### `destination_recommendation_feedback` (Analytics)

Tracks recommendation quality (shown, clicked, used in booking).

```sql
CREATE TABLE destination_recommendation_feedback (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recommended_location JSONB NOT NULL,
  recommended_label TEXT,
  shown BOOLEAN DEFAULT true,           -- Was it displayed?
  clicked BOOLEAN DEFAULT false,        -- Did user click it?
  used_in_booking BOOLEAN DEFAULT false,-- Did they actually use it?
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX ON destination_recommendation_feedback (user_id, created_at DESC);
```

#### RLS Policies

All three tables use strict user-isolation RLS policies:

- Users can only read their own rows
- Users can only insert/update/delete their own rows
- Admins have full access (see database migration for exact policies)

---

## Scoring Algorithm

### Recommendation Score (0–1)

Each destination is scored on three factors:

```
score = frequencyScore (0.5) + recencyScore (0.3) + timeMatchScore (0.2)
```

#### 1. Frequency Score (0–0.5)

How often has this destination appeared in history?

```
frequencyScore = min(1, visitCount / 50) × 0.5
```

- Visit 50+ times: 0.5 points
- Visit 25 times: 0.25 points
- Visit 1 time: 0.01 points

#### 2. Recency Score (0–0.3)

How recently was this destination visited?

```
daysSinceLastVisit = (today - lastVisitDate) / (24 hours)
recencyScore = max(0, (1 - daysSinceLastVisit / 30)) × 0.3
```

- Visited today: 0.3 points
- Visited 7 days ago: 0.21 points
- Visited 30+ days ago: 0 points

#### 3. Time-of-Day Match (0–0.2)

Does the current hour match historical patterns?

```
hourDiff = |historicalHour - currentHour| (shortest wraparound)
timeMatchScore = max(0, (1 - hourDiff / 12)) × 0.2
```

- Visit usually at 09:00, current hour is 09:00: 0.2 points
- Visit usually at 09:00, current hour is 12:00: 0.15 points
- Visit usually at 09:00, current hour is 21:00: 0 points

### Saved Destination Score

Saved destinations get a high baseline score:

```
score = 0.8 + usageBonus (0–0.2) + recencyBonus (0–0.1)
```

- Always ≥ 0.8 (high priority)
- Frequently used: +0.2 (up to 1.0)
- Recently used: +0.1 (up to 1.0)

---

## API Reference

### Server Functions

#### `getDestinationRecommendationsFn(request)`

Fetch destination recommendations for current user.

**Input:**

```typescript
{
  currentLocation?: LatLng,      // { lat, lng } for proximity filtering
  dayOfWeek?: string,            // "Monday", etc.
  hourOfDay?: number,            // 0-23
  limit?: number,                // Max results (default: 10)
  includeSaved?: boolean,        // Default: true
  includeHistory?: boolean,      // Default: true
}
```

**Output:**

```typescript
{
  destinations: [
    {
      location: { lat, lng },
      label?: string,
      frequencyRank: number,       // Visit count
      recencyScore: number,        // 0-1
      timeMatchScore: number,      // 0-1
      combinedScore: number,       // 0-1 (overall recommendation strength)
      source: "saved" | "history",
    },
    // ... sorted by combinedScore DESC
  ],
  context: {
    currentTime: Date,
    dayOfWeek: string,
    hourOfDay: number,
    userHistoryCount: number,
    savedDestinationCount: number,
  },
  hasEnoughData: boolean,         // User has ≥5 trips
}
```

#### `listSavedDestinationsFn()`

Get all saved destinations for current user.

**Output:** `SavedDestination[]`

#### `upsertSavedDestinationFn(request)`

Create or update a saved destination.

**Input:**

```typescript
{
  label: string,                // "Home", "Work", etc.
  location: LatLng,             // { lat, lng }
  category?: "home" | "work" | "school" | "custom",
  iconEmoji?: string,           // "🏠"
  colorHex?: string,            // "#FF5733"
}
```

**Output:** `SavedDestination | null`

#### `deleteSavedDestinationFn(id)`

Delete a saved destination.

**Input:** `{ id: string }`

**Output:** `{ ok: boolean, message: string }`

#### `logRideDestinationFn(data)`

Log a completed booking to trip history.

**Input:**

```typescript
{
  pickupLocation: LatLng,
  dropoffLocation: LatLng,
  dropoffLabel?: string,        // "Mall of Africa", etc.
  tripDistanceKm?: number,
  tripDurationMin?: number,
  vehicleClass?: string,
  rating?: number,              // 1-5
  notes?: string,
}
```

**Output:** `{ ok: boolean, message: string }`

#### `clearRideHistoryFn(confirm)`

Clear all ride history (soft delete). **Destructive operation.**

**Input:** `{ confirm: boolean }`

**Output:** `{ ok: boolean, message: string }`

#### `logRecommendationFeedbackFn(feedback)`

Log user interaction with recommendations (analytics).

**Input:**

```typescript
{
  recommendedLocation: LatLng,
  recommendedLabel?: string,
  shown: boolean,               // Was it displayed?
  clicked?: boolean,
  usedInBooking?: boolean,
}
```

**Output:** `{ ok: boolean }`

---

## React Hooks

### `useDestinationRecommendations(request?)`

Fetch recommendations (with caching).

```typescript
const { data, isLoading, error } = useDestinationRecommendations({
  limit: 5,
  includeSaved: true,
});

// data = DestinationRecommendation
// Cache: 5 min stale, 10 min garbage collection
```

### `useSavedDestinations()`

Fetch user's saved destinations.

```typescript
const { data = [] } = useSavedDestinations();
// data = SavedDestination[]
```

### `useUpsertSavedDestination()`

Mutation to create/update saved destination.

```typescript
const mutation = useUpsertSavedDestination();

mutation.mutate({
  label: "Work",
  location: { lat: -25.5, lng: 28.0 },
  category: "work",
  iconEmoji: "💼",
});
```

### `useDeleteSavedDestination()`

Mutation to delete saved destination.

```typescript
const mutation = useDeleteSavedDestination();
mutation.mutate(destinationId);
```

### `useLogRideDestination()`

Mutation to log completed booking.

```typescript
const mutation = useLogRideDestination();

mutation.mutate({
  pickupLocation: { lat: -25.5, lng: 28.0 },
  dropoffLocation: { lat: -25.6, lng: 28.1 },
  dropoffLabel: "Mall of Africa",
  tripDistanceKm: 15.2,
  tripDurationMin: 25,
  rating: 5,
});
```

### `useClearRideHistory()`

Mutation to clear all history (requires confirmation).

```typescript
const mutation = useClearRideHistory();
mutation.mutate(true); // Pass true to confirm
```

### `useDestinationSelectionFlow(options?)`

High-level hook combining recommendations, selection, and feedback.

```typescript
const {
  destination, // Current recommendation
  destinations, // All recommendations
  isLoading,
  hasEnoughData,
  onSelect, // Call when user selects
  onDismiss, // Call when user dismisses
} = useDestinationSelectionFlow({
  onSelected: (dest) => setBookingDestination(dest),
  onDismissed: () => console.log("dismissed"),
});
```

---

## Privacy & Security

### User Isolation (RLS)

Every table has strict row-level security:

- Users can only access their own data
- No cross-user data leakage possible
- Admins can override via special roles
- Enforced at database level (cannot be bypassed)

### Data Retention

- **Rides**: Stored indefinitely until user archives/deletes
- **Saved Destinations**: User controls (can delete anytime)
- **Feedback**: Kept for analytics, aggregated only (never individual-level exposed)
- **Deletion**: Soft-delete (archived flag) allows recovery; no irreversible hard-delete in normal workflow

### No PII Storage

- Only coordinates (lat/lng) are stored
- No addresses, names, or sensitive metadata
- Place labels are user-provided (under user control)

### Explainability

Every recommendation includes:

- Source (saved vs. history)
- Scoring breakdown (frequency, recency, time-match)
- User can see why a destination was suggested

---

## Usage Examples

### Example 1: Basic Recommendation Display

```typescript
import { useDestinationRecommendations } from "@/lib/hooks/use-destination-recommendations";

function BookingScreen() {
  const { data, isLoading } = useDestinationRecommendations({
    limit: 3,
    includeSaved: true,
  });

  if (isLoading) return <Spinner />;
  if (!data?.destinations?.length) {
    return <p>No recommendations yet. Take a few rides first!</p>;
  }

  return (
    <div>
      {data.destinations.map((dest) => (
        <DestinationCard key={dest.location.lat} {...dest} />
      ))}
    </div>
  );
}
```

### Example 2: Save a Favorite Place

```typescript
import { useUpsertSavedDestination } from "@/lib/hooks/use-destination-recommendations";

function SaveLocationModal({ location, onClose }) {
  const mutation = useUpsertSavedDestination();

  const handleSave = (label: string) => {
    mutation.mutate({
      label,
      location,
      category: "custom",
      iconEmoji: "📍",
    });
    onClose();
  };

  return (
    <Dialog>
      <input placeholder="e.g., My Gym" onSubmit={(e) => handleSave(e.target.value)} />
      <button onClick={() => handleSave("Custom Place")} disabled={mutation.isPending}>
        Save
      </button>
    </Dialog>
  );
}
```

### Example 3: Log Completed Booking

```typescript
import { useLogRideDestination } from "@/lib/hooks/use-destination-recommendations";

function RideCompleteScreen({ ride }) {
  const logRide = useLogRideDestination();
  const [rating, setRating] = useState(0);

  const handleComplete = () => {
    logRide.mutate({
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
      dropoffLabel: ride.dropoffPlaceName,
      tripDistanceKm: ride.distance,
      tripDurationMin: ride.duration,
      rating,
    });
  };

  return (
    <div>
      <h2>Rate this ride</h2>
      <RatingInput value={rating} onChange={setRating} />
      <button onClick={handleComplete}>Complete & Learn</button>
    </div>
  );
}
```

### Example 4: Clear History with Confirmation

```typescript
function PrivacySettingsScreen() {
  const clearHistory = useClearRideHistory();
  const [confirming, setConfirming] = useState(false);

  const handleClear = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clearHistory.mutate(true);
  };

  return (
    <div>
      <button
        onClick={handleClear}
        className={confirming ? "bg-red-500" : "bg-gray-500"}
      >
        {confirming
          ? "Click again to confirm — this cannot be undone"
          : "Clear All History"}
      </button>
    </div>
  );
}
```

---

## Testing

### Unit Tests

Pure recommendation logic in `__tests__/recommend.test.ts`:

```bash
npm run test -- src/lib/destinations/__tests__/recommend.test.ts
```

Tests cover:

- Haversine distance calculations
- Scoring algorithm (frequency, recency, time-of-day)
- Deduplication logic
- Ranking determinism

### Integration Tests

Server functions and database operations:

```bash
npm run test -- src/lib/dispatch/__tests__/destination-functions.test.ts
```

### Component Tests

React hooks and UI:

```bash
npm run test -- src/components/__tests__/destination-*.test.tsx
```

---

## Performance Considerations

### Caching Strategy

- **Recommendations**: 5 min stale, 10 min garbage collection
- **Saved Destinations**: 10 min stale, 30 min garbage collection
- **Feedback**: Non-cached (fire-and-forget analytics)

### Database Indexes

```sql
-- Recommendation queries (sorted by recency)
CREATE INDEX ON ride_destinations (user_id, archived, completed_at DESC);

-- Time-of-day matching
CREATE INDEX ON ride_destinations (user_id, day_of_week, hour_of_day);

-- Saved destination lookups
CREATE INDEX ON saved_destinations (user_id, usage_count DESC);
```

### Limits

- Max 100 ride history entries fetched per query (configurable)
- Max 10 recommendations returned (configurable)
- Max 50 saved destinations (arbitrary, no hard limit in schema)

---

## Configuration

Recommendation scoring can be customized via `RecommendationConfig`:

```typescript
interface RecommendationConfig {
  minVisitsToRecommend: 2; // Minimum visits before suggesting
  historyWindowDays: 90; // How far back to look
  locationToleranceKm: 0.1; // Merge nearby locations (100m)
  savedDestinationBias: 0.15; // Bonus for saved destinations
  maxRecommendations: 10; // Max results to return
}
```

Override in hook calls:

```typescript
rankDestinationRecommendations(saved, history, hour, {
  minVisitsToRecommend: 3,
  maxRecommendations: 5,
});
```

---

## Troubleshooting

### No Recommendations Despite Bookings

**Check:**

1. Do you have ≥5 ride history entries? (`hasEnoughData` flag)
2. Have you passed the `minVisitsToRecommend` threshold (default: 2)?
3. Are locations within the same Supabase database?

**Debug:**

```typescript
const { data } = useDestinationRecommendations();
console.log("User history count:", data?.context.userHistoryCount);
console.log("Has enough data:", data?.hasEnoughData);
```

### Recommendations Not Updating

**Check:**

1. Are mutations returning `ok: true`?
2. Did you call `logRideDestinationFn` after booking?
3. Check browser dev tools → Application → Storage (if query cache visible)

**Force refresh:**

```typescript
const { refetch } = useDestinationRecommendations();
refetch();
```

### Time-of-Day Not Matching

**Check:**

1. Is `hourOfDay` being computed correctly? (Should be 0-23)
2. Did previous rides have `hourOfDay` recorded? (Check database)
3. Is the current hour within 12-hour window of historical hour?

---

## Future Enhancements

- [ ] Geographic clustering (suggest "areas" not just exact locations)
- [ ] Day-of-week filtering (suggest Friday destinations on Friday)
- [ ] Cross-device sync (same recommendations on web & mobile)
- [ ] A/B testing (experiment with ranking algorithms)
- [ ] Machine learning integration (predictive modeling)
- [ ] Offline support (cache recommendations locally)
- [ ] User feedback loop (thumbs-up/down on suggestions)

---

## Support

For issues or feature requests, contact the backend team or open an issue in the repository.
