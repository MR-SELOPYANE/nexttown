import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";

/**
 * SHARED REALTIME CHANNEL REGISTRY
 * ------------------------------------------------------------------
 * Supabase Realtime limits active connections; two live maps (e.g. two open
 * passenger tabs) must never open duplicate channels for the same filter.
 *
 * The registry is MODULE-LEVEL (one per app instance), so every consumer of a
 * given filter shares one physical channel and one subscription. Components
 * "acquire" a channel by signature; when the last consumer releases it the
 * channel is removed and closed.
 */

export type RealtimeChannelHandle = {
  /** Subscription state of the underlying channel (last known). */
  state: RealtimeChannelState;
  /** Release this component's hold; closes the channel when refcount hits 0. */
  release(): void;
};

export type RealtimeChannelState = "connecting" | "subscribed" | "error" | "closed" | "idle";

export type RealtimeChannelOptions = {
  /** Dedupe key; two acquisitions with the same signature share a channel. */
  signature: string;
  /** Bind channel listeners (e.g. `channel.on("postgres_changes", ...)`). */
  setup: (channel: RealtimeChannel) => void;
  /** Called whenever the underlying subscription state transitions. */
  onStateChange: (state: RealtimeChannelState) => void;
};

type RegistryEntry = {
  channel: RealtimeChannel;
  client: SupabaseClient;
  refCount: number;
  state: RealtimeChannelState;
  onStateChange: Set<(state: RealtimeChannelState) => void>;
};

const registry = new Map<string, RegistryEntry>();

function mapSubscribeState(
  s: (typeof REALTIME_SUBSCRIBE_STATES)[keyof typeof REALTIME_SUBSCRIBE_STATES],
): RealtimeChannelState {
  switch (s) {
    case REALTIME_SUBSCRIBE_STATES.SUBSCRIBED:
      return "subscribed";
    case REALTIME_SUBSCRIBE_STATES.TIMED_OUT:
    case REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR:
      return "error";
    case REALTIME_SUBSCRIBE_STATES.CLOSED:
      return "closed";
    default:
      return "connecting";
  }
}

function setEntryState(entry: RegistryEntry, state: RealtimeChannelState) {
  if (entry.state === state) return;
  entry.state = state;
  entry.onStateChange.forEach((cb) => cb(state));
}

function teardown(entry: RegistryEntry) {
  try {
    entry.channel.unsubscribe();
  } catch {
    // channel may already be gone; nothing to do
  }
  try {
    entry.client.removeChannel(entry.channel);
  } catch {
    // no-op
  }
  setEntryState(entry, "closed");
  entry.onStateChange.clear();
}

/**
 * Acquire a Realtime channel with a shared lifecycle. Returns a handle whose
 * `release()` balances the acquisition. The underlying channel is created on
 * first acquisition and torn down when the last holder releases.
 */
export function acquireRealtimeChannel(
  client: SupabaseClient,
  options: RealtimeChannelOptions,
): RealtimeChannelHandle {
  const { signature, setup, onStateChange } = options;
  const existing = registry.get(signature);

  if (existing) {
    existing.refCount += 1;
    existing.onStateChange.add(onStateChange);
    onStateChange(existing.state);
    return {
      state: existing.state,
      release() {
        releaseSignature(signature);
      },
    };
  }

  const channel = client.channel(signature);
  const entry: RegistryEntry = {
    channel,
    client,
    refCount: 1,
    state: "connecting",
    onStateChange: new Set([onStateChange]),
  };
  registry.set(signature, entry);

  setup(channel);
  channel.subscribe((status) => {
    const mapped = mapSubscribeState(status);
    setEntryState(entry, mapped);
  });

  return {
    state: entry.state,
    release() {
      releaseSignature(signature);
    },
  };
}

function releaseSignature(signature: string) {
  const entry = registry.get(signature);
  if (!entry) return;
  entry.refCount -= 1;
  if (entry.refCount <= 0) {
    teardown(entry);
    registry.delete(signature);
  }
}

/** For tests/dev tooling: close every shared channel. */
export function closeAllRealtimeChannels(client: SupabaseClient) {
  registry.forEach((entry) => {
    try {
      client.removeChannel(entry.channel);
    } catch {
      // no-op
    }
  });
  registry.clear();
}
