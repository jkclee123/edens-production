"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loading } from "@/components/Loading";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<"all" | "none" | Id<"locations">>("all");
  const userEmail = useUserEmail();

  // Debounced search value for API calls
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce using setTimeout
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    // Clear previous timeout and set new one
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  // Fetch locations for the toolbar and table
  const locations = useQuery(api.locations.list);

  // Fetch inventory items with filters (includes per-user location ordering)
  const inventory = useQuery(api.inventory.list, {
    search: debouncedSearch || undefined,
    locationId: locationFilter,
    userEmail,
  });

  // Loading state
  if (locations === undefined || inventory === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground font-display">Inventory</h1>
        </div>
        <Loading message="Loading inventory..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground font-display">Inventory</h1>
        <span className="text-sm text-text-muted">
          {inventory.totalCount} {inventory.totalCount === 1 ? "item" : "items"}
        </span>
      </div>

      <InventoryToolbar
        search={search}
        onSearchChange={handleSearchChange}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        locations={locations}
      />

      <InventoryTable
        groups={inventory.groups}
        locations={locations}
        totalCount={inventory.totalCount}
      />
    </div>
  );
}
