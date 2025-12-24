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

  // Search is already debounced by InventoryToolbar
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  // Fetch locations for the toolbar and table
  const locations = useQuery(api.locations.list);

  // Fetch inventory items with filters (includes per-user location ordering)
  const inventory = useQuery(api.inventory.list, {
    search: search || undefined,
    locationId: locationFilter,
    userEmail,
  });

  // Initial loading state only (don't blank out on search updates)
  const isInitialLoad = locations === undefined || (inventory === undefined && search === "");

  if (isInitialLoad) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">庫存</h1>
        </div>
        <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />
        <Loading message="載入庫存..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">庫存</h1>
      </div>
      <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

      <InventoryToolbar
        search={search}
        onSearchChange={handleSearchChange}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        locations={locations ?? []}
      />

      {inventory === undefined ? (
        <div className="flex justify-center py-12">
          <Loading message="更新搜尋結果..." />
        </div>
      ) : (
        <InventoryTable
          groups={inventory.groups}
          locations={locations ?? []}
          totalCount={inventory.totalCount}
        />
      )}
    </div>
  );
}
