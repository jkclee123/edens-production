"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loading } from "@/components/Loading";
import { InventoryToolbar } from "@/components/inventory/InventoryToolbar";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { DailyVerseDivider } from "@/components/ui";
export default function GuestInventoryPage() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<"all" | "none" | Id<"locations">>("all");

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);

  const locations = useQuery(api.locations.list);
  const inventory = useQuery(api.inventory.list, {
    search: search || undefined,
    locationId: locationFilter,
    userEmail: undefined,
  });

  const isInitialLoad = locations === undefined || (inventory === undefined && search === "");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">庫存</h1>
      </div>
      <DailyVerseDivider />

      {isInitialLoad ? (
        <Loading message="載入庫存..." />
      ) : (
        <>
          <InventoryToolbar
            search={search}
            onSearchChange={handleSearchChange}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
            locations={locations ?? []}
            hideActions={true}
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
              readOnly={true}
              hideQty={true}
            />
          )}
        </>
      )}
    </div>
  );
}
