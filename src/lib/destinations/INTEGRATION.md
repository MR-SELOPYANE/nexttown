# Destination Recommendations — Integration Guide

This guide walks through integrating destination recommendations into your booking flow.

---

## Step 1: Database Setup

Apply the migration to create tables and RLS policies:

```bash
# Using Supabase CLI
supabase migration up 20260101000005_destination_recommendations.sql

# Or manually in Supabase Dashboard:
# SQL Editor → Run the migration script directly
```

This creates:

- `ride_destinations` table (trip history)
- `saved_destinations` table (favorite places)
- `destination_recommendation_feedback` table (analytics)
- RLS policies (user isolation)
- Helper functions (`log_ride_completion`, `get_destination_recommendations`)
- Indexes (for performance)

---

## Step 2: Confirm Server Functions

Check that server functions are accessible:

```typescript
// src/lib/dispatch/destination-functions.ts

export const getDestinationRecommendationsFn = createServerFn(...);
export const listSavedDestinationsFn = createServerFn(...);
export const upsertSavedDestinationFn = createServerFn(...);
export const deleteSavedDestinationFn = createServerFn(...);
export const logRideDestinationFn = createServerFn(...);
export const clearRideHistoryFn = createServerFn(...);
export const logRecommendationFeedbackFn = createServerFn(...);
```

### Register in Dispatch Server

Add to `src/lib/dispatch/dispatch-server.ts`:

```typescript
export * from "./destination-functions";
```

---

## Step 3: Add React Hooks

React hooks are ready in `src/lib/hooks/use-destination-recommendations.ts`:

```typescript
// Fetch recommendations
useDestinationRecommendations(request?)

// Fetch saved destinations
useSavedDestinations()

// Mutations
useUpsertSavedDestination()
useDeleteSavedDestination()
useLogRideDestination()
useClearRideHistory()
useLogRecommendationFeedback()

// High-level workflow hook
useDestinationSelectionFlow(options?)
```

---

## Step 4: Create UI Components

### Component 1: Destination Suggestions Panel

Display recommendations in the booking flow:

```typescript
// src/components/site/destination-suggestions-panel.tsx

import { useDestinationRecommendations } from "@/lib/hooks/use-destination-recommendations";

export function DestinationSuggestionsPanel({
  onSelect,
}: {
  onSelect?: (dest: SavedDestination | { location: LatLng; label?: string }) => void;
}) {
  const { data, isLoading } = useDestinationRecommendations({
    limit: 5,
    includeSaved: true,
  });

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!data?.hasEnoughData) {
    return (
      <div className="p-4 bg-blue-50 rounded">
        <p className="text-sm text-gray-600">
          Take a few rides to unlock destination recommendations.
        </p>
      </div>
    );
  }

  if (data.destinations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Suggested Destinations</h3>
      {data.destinations.map((dest, idx) => (
        <button
          key={`${dest.location.lat}-${dest.location.lng}`}
          onClick={() => onSelect?.(dest)}
          className="w-full text-left p-3 border rounded hover:bg-blue-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{dest.label || "Unnamed"}</p>
              <p className="text-xs text-gray-500">
                {dest.source === "saved" ? "Saved" : `Visited ${dest.frequencyRank}x`}
              </p>
            </div>
            <span className="text-lg">
              {dest.source === "saved" ? "⭐" : "📍"}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
```

### Component 2: Saved Destinations Manager

Allow users to manage their saved places:

```typescript
// src/components/site/saved-destinations-manager.tsx

import { useState } from "react";
import {
  useSavedDestinations,
  useUpsertSavedDestination,
  useDeleteSavedDestination,
} from "@/lib/hooks/use-destination-recommendations";

export function SavedDestinationsManager() {
  const { data: saved = [] } = useSavedDestinations();
  const upsert = useUpsertSavedDestination();
  const deleteSaved = useDeleteSavedDestination();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    label: "",
    category: "custom",
  });

  const handleAdd = () => {
    if (!form.label || !currentLocation) return;

    upsert.mutate({
      label: form.label,
      location: currentLocation,
      category: form.category,
    });

    setForm({ label: "", category: "custom" });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Saved Destinations</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-blue-600 text-sm font-medium"
        >
          {isAdding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {isAdding && (
        <div className="p-3 border rounded space-y-2">
          <input
            type="text"
            placeholder="e.g., Home"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="school">School</option>
            <option value="custom">Custom</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={upsert.isPending}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded"
          >
            {upsert.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {saved.map((dest) => (
          <div
            key={dest.id}
            className="p-3 border rounded flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{dest.label}</p>
              <p className="text-xs text-gray-500">
                Used {dest.usageCount}x
              </p>
            </div>
            <button
              onClick={() => deleteSaved.mutate(dest.id)}
              disabled={deleteSaved.isPending}
              className="text-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Step 5: Integrate into Booking Flow

### 5A: Show Recommendations on Booking Screen

```typescript
// src/components/site/booking-modal.tsx

import { DestinationSuggestionsPanel } from "./destination-suggestions-panel";

export function BookingModal() {
  const [selectedDestination, setSelectedDestination] = useState(null);

  return (
    <Dialog>
      <DialogContent>
        <h2>Book a Ride</h2>

        {/* Pickup input */}
        <input placeholder="Pickup location" />

        {/* DESTINATION RECOMMENDATIONS */}
        <DestinationSuggestionsPanel
          onSelect={(dest) => {
            setSelectedDestination(dest);
            // Update form with selected location
          }}
        />

        {/* Or manual destination input */}
        <input
          placeholder="Destination"
          value={selectedDestination?.label}
          onChange={(e) => setSelectedDestination(null)}
        />

        <button>Request Ride</button>
      </DialogContent>
    </Dialog>
  );
}
```

### 5B: Log Ride Completion

After ride completion (driver arrived, payment done):

```typescript
// src/components/site/ride-complete-screen.tsx

import { useLogRideDestination } from "@/lib/hooks/use-destination-recommendations";

export function RideCompleteScreen({ ride }) {
  const logRide = useLogRideDestination();
  const [rating, setRating] = useState(0);

  const handleComplete = () => {
    logRide.mutate({
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
      dropoffLabel: ride.dropoffPlaceName, // Can be null
      tripDistanceKm: ride.distanceKm,
      tripDurationMin: ride.durationMin,
      vehicleClass: ride.vehicleClass,
      rating,
    });
  };

  return (
    <div>
      <h2>Ride Complete!</h2>
      <p>{ride.distanceKm} km • {ride.durationMin} min</p>

      <label>Rate this ride</label>
      <RatingInput value={rating} onChange={setRating} />

      <button onClick={handleComplete}>Done</button>
    </div>
  );
}
```

---

## Step 6: Privacy Settings Page

Add destination control options:

```typescript
// src/components/site/privacy-settings.tsx

import {
  useClearRideHistory,
  useSavedDestinations,
  useDeleteSavedDestination,
} from "@/lib/hooks/use-destination-recommendations";

export function PrivacySettings() {
  const { data: saved = [] } = useSavedDestinations();
  const clearHistory = useClearRideHistory();
  const deleteSaved = useDeleteSavedDestination();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="space-y-6">
      {/* Saved Destinations */}
      <section>
        <h3 className="font-semibold mb-3">Saved Destinations</h3>
        <p className="text-sm text-gray-600 mb-3">
          You have {saved.length} saved location(s).
        </p>
        {saved.map((dest) => (
          <div key={dest.id} className="flex justify-between items-center p-2 border-b">
            <span>{dest.label}</span>
            <button
              onClick={() => deleteSaved.mutate(dest.id)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Trip History */}
      <section>
        <h3 className="font-semibold mb-3">Trip History</h3>
        <p className="text-sm text-gray-600 mb-3">
          Your trip history helps us suggest destinations.
        </p>
        <button
          onClick={() => {
            if (!confirmClear) {
              setConfirmClear(true);
              return;
            }
            clearHistory.mutate(true);
          }}
          className={`px-4 py-2 rounded ${
            confirmClear
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {confirmClear
            ? "Click again to confirm — this cannot be undone"
            : "Clear Trip History"}
        </button>
      </section>
    </div>
  );
}
```

---

## Step 7: Testing Integration

### Test 1: Create First Ride History Entry

```typescript
const { mutate } = useLogRideDestination();

mutate({
  pickupLocation: { lat: -25.5, lng: 28.0 },
  dropoffLocation: { lat: -25.6, lng: 28.1 },
  dropoffLabel: "Test Location",
  tripDistanceKm: 5,
  tripDurationMin: 10,
  rating: 4,
});
```

Check Supabase:

```sql
SELECT * FROM ride_destinations WHERE user_id = 'your-user-id';
```

### Test 2: Get Recommendations

```typescript
const { data } = useDestinationRecommendations();
console.log("Recommendations:", data?.destinations);
console.log("Has enough data:", data?.hasEnoughData); // false until 5+ trips
```

### Test 3: Save a Destination

```typescript
const { mutate } = useUpsertSavedDestination();

mutate({
  label: "My Gym",
  location: { lat: -25.55, lng: 28.05 },
  category: "custom",
  iconEmoji: "💪",
});
```

Check Supabase:

```sql
SELECT * FROM saved_destinations WHERE user_id = 'your-user-id';
```

---

## Step 8: Analytics Dashboard (Optional)

Track recommendation quality:

```typescript
// src/components/admin/destination-analytics.tsx

import { useQuery } from "@tanstack/react-query";

export function DestinationAnalytics({ userId }) {
  const { data: stats } = useQuery({
    queryKey: ["destination-stats", userId],
    queryFn: () => getDestinationStatsFn({ data: { userId } }),
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <p className="text-gray-600">Total Recommendations</p>
        <p className="text-2xl font-bold">{stats?.totalRecommendations || 0}</p>
      </Card>
      <Card>
        <p className="text-gray-600">Click-Through Rate</p>
        <p className="text-2xl font-bold">{(stats?.clickThroughRate || 0).toFixed(1)}%</p>
      </Card>
      <Card>
        <p className="text-gray-600">Conversion Rate</p>
        <p className="text-2xl font-bold">{(stats?.conversionRate || 0).toFixed(1)}%</p>
      </Card>
    </div>
  );
}
```

---

## Checklist

- [ ] Database migration applied (`20260101000005_destination_recommendations.sql`)
- [ ] Server functions created (`destination-functions.ts`)
- [ ] Server functions registered in dispatch server
- [ ] Backend service layer created (`destination-service.ts`)
- [ ] React hooks created and tested (`use-destination-recommendations.ts`)
- [ ] DestinationSuggestionsPanel component added to booking flow
- [ ] SavedDestinationsManager component added (optional)
- [ ] `logRideDestinationFn` called on ride completion
- [ ] Privacy settings page includes history/destination management
- [ ] Tests written and passing
- [ ] Documentation complete

---

## Common Issues

### Issue: No recommendations shown despite bookings

**Solution:**

- Verify `hasEnoughData` is true (need ≥5 trips)
- Check that `logRideDestinationFn` was called successfully
- Confirm RLS policies allow user to read their own `ride_destinations` rows

```sql
SELECT COUNT(*) FROM ride_destinations
WHERE user_id = 'your-user-id' AND archived = false;
```

### Issue: Saved destinations not appearing

**Solution:**

- Verify `useSavedDestinations()` returns data
- Check that upsert mutation returned successfully
- Confirm user has access to `saved_destinations` table via RLS

```sql
SELECT * FROM saved_destinations
WHERE user_id = 'your-user-id';
```

### Issue: Time-of-day not matching

**Solution:**

- Verify `hourOfDay` is computed correctly (0-23 format)
- Check previous rides have `hourOfDay` populated in database
- Ensure current hour is within 12-hour window of historical hour

---

## Next Steps

1. **Analytics Dashboard**: Build insights into recommendation quality
2. **A/B Testing**: Experiment with different scoring weights
3. **Geographic Clustering**: Suggest "areas" instead of exact points
4. **Day-of-Week Context**: Suggest Friday destinations on Friday
5. **Machine Learning**: Integrate predictive modeling for better rankings

---

## Support

For help integrating, open an issue or contact the backend team.
