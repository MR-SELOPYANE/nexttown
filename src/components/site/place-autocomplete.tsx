import { useEffect, useRef, useState, useCallback } from "react";
import {
  loadGoogleMaps,
  searchPlaces,
  getPlaceDetails,
  type PlaceSuggestion,
} from "@/lib/google-maps";
import type { LatLng } from "@/lib/sa-places";
import { MapPin, Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (coords: LatLng, name: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  country?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
};

export function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  icon,
  country = "ZA",
  autoFocus,
  onFocus,
  onBlur,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Legacy Google Places Autocomplete (fallback)
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !inputRef.current || acRef.current) return;
        const ac = new maps.places.Autocomplete(inputRef.current, {
          types: ["geocode", "establishment"],
          componentRestrictions: { country },
          fields: ["geometry.location", "name", "formatted_address"],
        });
        acRef.current = ac;
        listenerRef.current = ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const loc = place.geometry?.location;
          if (!loc) return;
          const coords: LatLng = { lat: loc.lat(), lng: loc.lng() };
          const name = place.formatted_address ?? place.name ?? value;
          onSelect(coords, name);
          setShowDropdown(false);
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      listenerRef.current?.remove();
      acRef.current = null;
    };
  }, [country]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim() || query.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      setLoading(true);
      try {
        const results = await searchPlaces(query, country);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    },
    [country],
  );

  const handleChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const handleSelect = async (suggestion: PlaceSuggestion) => {
    setLoading(true);
    const details = await getPlaceDetails(suggestion.placeId);
    if (details) {
      onSelect({ lat: details.lat, lng: details.lng }, details.address || suggestion.name);
    } else {
      onSelect({ lat: suggestion.lat, lng: suggestion.lng }, suggestion.name);
    }
    setShowDropdown(false);
    setLoading(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
    if (suggestions.length > 0 && value.trim().length >= 2) setShowDropdown(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setFocused(false);
      setShowDropdown(false);
      onBlur?.();
    }, 200);
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="flex items-center gap-2.5">
        <span className="text-muted-foreground shrink-0">
          {icon ?? <Search className="size-4" />}
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={placeholder}
          type="text"
          autoComplete="off"
          autoFocus={autoFocus}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {value && focused && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            className="p-0.5 rounded-full hover:bg-white/10 text-muted-foreground shrink-0"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-white/10 bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
        >
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <div className="size-3.5 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
              Searching…
            </div>
          )}
          {!loading && suggestions.length === 0 && value.trim().length >= 2 && (
            <div className="px-4 py-3 text-xs text-muted-foreground">No results found</div>
          )}
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">{s.address}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
