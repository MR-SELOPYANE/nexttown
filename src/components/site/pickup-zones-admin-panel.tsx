/**
 * SMART PICKUP ZONES â€” ADMIN PANEL
 * --------------------------------------------------------------------------
 * Management interface for operators to create, edit, and manage pickup zones.
 * Accessible only to admin users.
 *
 * Features:
 * - List all zones (with filtering by region and status)
 * - Create new zones
 * - Edit existing zones
 * - Toggle active/inactive
 * - Map view for spatial preview
 * - Analytics dashboard (which recommendations get accepted)
 */

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  ChevronDown,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getPickupZonesByRegionFn,
  upsertPickupZoneFn,
  deletePickupZoneFn,
} from "@/lib/dispatch/pickup-zone-functions";
import type { LatLng, PickupPlaceType, PickupZone } from "@/lib/pickup/types";
import { cn } from "@/lib/utils";

const REGIONS = [
  { value: "gauteng", label: "Gauteng" },
  { value: "kwazulu-natal", label: "KwaZulu-Natal" },
  { value: "western-cape", label: "Western Cape" },
  { value: "limpopo", label: "Limpopo" },
  { value: "eastern-cape", label: "Eastern Cape" },
  { value: "northern-cape", label: "Northern Cape" },
  { value: "free-state", label: "Free State" },
  { value: "mpumalanga", label: "Mpumalanga" },
  { value: "north-west", label: "North West" },
];

const PLACE_TYPES: { value: PickupPlaceType; label: string }[] = [
  { value: "gate", label: "Gate / Entrance" },
  { value: "campus", label: "Campus" },
  { value: "station", label: "Train/Transit Station" },
  { value: "airport", label: "Airport" },
  { value: "mall", label: "Shopping Mall" },
  { value: "hospital", label: "Hospital" },
  { value: "taxi_rank", label: "Taxi Rank" },
  { value: "bus_terminal", label: "Bus Terminal" },
  { value: "office_park", label: "Office Park" },
  { value: "landmark", label: "Landmark" },
];

interface PickupZoneFormData extends Partial<PickupZone> {
  centerLat?: string;
  centerLng?: string;
  entranceLat?: string;
  entranceLng?: string;
}

export function PickupZonesAdminPanel() {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [editingZone, setEditingZone] = useState<PickupZone | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PickupZoneFormData>({});

  // Fetch zones for the selected region
  const {
    data: zones = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pickup-zones-admin", selectedRegion],
    queryFn: () => getPickupZonesByRegionFn({ data: { region: selectedRegion || undefined } }),
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const upsertZone = useMutation({
    mutationFn: async (zone: PickupZone) => {
      const result = await upsertPickupZoneFn({
        data: {
          id: zone.id,
          name: zone.name,
          center: zone.center,
          entrance: zone.entrance,
          radius: zone.radius,
          active: zone.active,
          priority: zone.priority,
          placeType: zone.placeType,
          description: zone.description,
          region: zone.region,
          roadAccessible: zone.roadAccessible,
          pedestrianFriendly: zone.pedestrianFriendly,
          trafficRestrictions: zone.trafficRestrictions,
          notesForDrivers: zone.notesForDrivers,
        },
      });
      return result;
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Zone saved successfully");
        setIsDialogOpen(false);
        setEditingZone(null);
        setFormData({});
        refetch();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save zone");
    },
  });

  const deleteZone = useMutation({
    mutationFn: (id: string) => deletePickupZoneFn({ data: { id } }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Zone deleted successfully");
        refetch();
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete zone");
    },
  });

  function openNewZoneDialog() {
    setEditingZone(null);
    setFormData({
      active: true,
      priority: 50,
      placeType: "gate",
      region: selectedRegion || "gauteng",
      radius: 2,
    });
    setIsDialogOpen(true);
  }

  function openEditZoneDialog(zone: PickupZone) {
    setEditingZone(zone);
    setFormData({
      ...zone,
      centerLat: zone.center.lat.toString(),
      centerLng: zone.center.lng.toString(),
      entranceLat: zone.entrance.lat.toString(),
      entranceLng: zone.entrance.lng.toString(),
    });
    setIsDialogOpen(true);
  }

  function handleSubmit() {
    const errors: string[] = [];

    if (!formData.id?.trim()) errors.push("Zone ID is required");
    if (!formData.name?.trim()) errors.push("Zone name is required");
    if (!formData.centerLat || !formData.centerLng) errors.push("Center coordinates required");
    if (!formData.entranceLat || !formData.entranceLng)
      errors.push("Entrance coordinates required");

    if (errors.length > 0) {
      toast.error(errors.join("; "));
      return;
    }

    const zone: PickupZone = {
      id: formData.id!,
      name: formData.name!,
      center: {
        lat: parseFloat(formData.centerLat!),
        lng: parseFloat(formData.centerLng!),
      },
      entrance: {
        lat: parseFloat(formData.entranceLat!),
        lng: parseFloat(formData.entranceLng!),
      },
      radius: formData.radius || 2,
      active: formData.active !== false,
      priority: formData.priority || 50,
      placeType: (formData.placeType || "gate") as PickupPlaceType,
      description: formData.description || undefined,
      region: formData.region || undefined,
      roadAccessible: formData.roadAccessible !== false,
      pedestrianFriendly: formData.pedestrianFriendly === true,
      trafficRestrictions: formData.trafficRestrictions,
      notesForDrivers: formData.notesForDrivers,
    };

    upsertZone.mutate(zone);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Pickup Zones</h2>
        <Button onClick={openNewZoneDialog} size="sm">
          <Plus className="size-4 mr-2" />
          New Zone
        </Button>
      </div>

      {/* Region filter */}
      <div className="flex items-center gap-3">
        <Label htmlFor="region" className="text-sm font-medium">
          Filter by Region:
        </Label>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All regions</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Zones list */}
      <div className="space-y-2 border rounded-lg divide-y">
        {isLoading && <div className="p-6 text-center text-muted-foreground">Loading zones...</div>}

        {!isLoading && zones.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">No zones found</div>
        )}

        {zones.map((zone) => (
          <div key={zone.id} className="p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{zone.name}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                    {zone.placeType?.replace(/_/g, " ")}
                  </span>
                  {!zone.active && (
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{zone.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    Center: {zone.center.lat.toFixed(4)}, {zone.center.lng.toFixed(4)}
                  </span>
                  <span>Radius: {zone.radius} km</span>
                  <span>Priority: {zone.priority}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEditZoneDialog(zone)}>
                  <Edit2 className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Delete zone "${zone.name}"? This cannot be undone.`)) {
                      deleteZone.mutate(zone.id);
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingZone ? "Edit Pickup Zone" : "Create New Pickup Zone"}</DialogTitle>
            <DialogDescription>
              {editingZone
                ? "Update the zone details below"
                : "Add a new known pickup location to the catalogue"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Zone ID */}
            <div>
              <Label htmlFor="id" className="text-sm font-medium">
                Zone ID (slug)
              </Label>
              <Input
                id="id"
                placeholder="e.g. tut-main-gate"
                value={formData.id || ""}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!!editingZone}
                className="mt-1 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier, cannot be changed after creation
              </p>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Zone Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. TUT South Campus Main Gate"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            {/* Place Type */}
            <div>
              <Label htmlFor="placeType" className="text-sm font-medium">
                Type
              </Label>
              <Select
                value={formData.placeType || "gate"}
                onValueChange={(v) => setFormData({ ...formData, placeType: v as PickupPlaceType })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLACE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div>
              <Label htmlFor="region" className="text-sm font-medium">
                Region
              </Label>
              <Select
                value={formData.region || "gauteng"}
                onValueChange={(v) => setFormData({ ...formData, region: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="centerLat" className="text-xs font-medium">
                  Center Lat
                </Label>
                <Input
                  id="centerLat"
                  type="number"
                  placeholder="-25.518"
                  step="0.0001"
                  value={formData.centerLat || ""}
                  onChange={(e) => setFormData({ ...formData, centerLat: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="centerLng" className="text-xs font-medium">
                  Center Lng
                </Label>
                <Input
                  id="centerLng"
                  type="number"
                  placeholder="28.1"
                  step="0.0001"
                  value={formData.centerLng || ""}
                  onChange={(e) => setFormData({ ...formData, centerLng: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="entranceLat" className="text-xs font-medium">
                  Entrance Lat
                </Label>
                <Input
                  id="entranceLat"
                  type="number"
                  placeholder="-25.5208"
                  step="0.0001"
                  value={formData.entranceLat || ""}
                  onChange={(e) => setFormData({ ...formData, entranceLat: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="entranceLng" className="text-xs font-medium">
                  Entrance Lng
                </Label>
                <Input
                  id="entranceLng"
                  type="number"
                  placeholder="28.1032"
                  step="0.0001"
                  value={formData.entranceLng || ""}
                  onChange={(e) => setFormData({ ...formData, entranceLng: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            {/* Radius */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="radius" className="text-sm font-medium">
                  Radius (km)
                </Label>
                <Input
                  id="radius"
                  type="number"
                  placeholder="2"
                  step="0.5"
                  value={formData.radius || ""}
                  onChange={(e) => setFormData({ ...formData, radius: parseFloat(e.target.value) })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="50"
                  value={formData.priority || ""}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="description"
                placeholder="e.g. South gate entrance, 24h security"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="trafficRestrictions" className="text-sm font-medium">
                Traffic restrictions
              </Label>
              <Input
                id="trafficRestrictions"
                placeholder="e.g. No stopping, bus-only lane"
                value={formData.trafficRestrictions?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trafficRestrictions: e.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  })
                }
                className="mt-1 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={formData.roadAccessible !== false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, roadAccessible: checked === true })
                  }
                />
                Road accessible
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={formData.pedestrianFriendly === true}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, pedestrianFriendly: checked === true })
                  }
                />
                Pedestrian friendly
              </label>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                checked={formData.active !== false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked as boolean })
                }
              />
              <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                Active
              </Label>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleSubmit}
                disabled={upsertZone.isPending}
              >
                <Save className="size-4 mr-2" />
                {upsertZone.isPending ? "Saving..." : "Save Zone"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PickupZonesAdminPanel;
