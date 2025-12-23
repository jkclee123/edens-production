"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Dialog, Input } from "@/components/ui";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import { useToast, getErrorMessage } from "@/components/ui/Toast";

interface InventoryToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  locationFilter: "all" | "none" | Id<"locations">;
  onLocationFilterChange: (filter: "all" | "none" | Id<"locations">) => void;
  locations: Doc<"locations">[];
}

const DEBOUNCE_MS = 500;

export function InventoryToolbar({
  search,
  onSearchChange,
  locationFilter,
  onLocationFilterChange,
  locations,
}: InventoryToolbarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [localSearch, setLocalSearch] = useState(search);
  const createItem = useMutation(api.inventory.create);
  const createLocation = useMutation(api.locations.create);
  const userEmail = useUserEmail();
  const { error: showError } = useToast();

  // Sync local search with external search prop
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const handleAddItem = async () => {
    setIsAdding(true);
    try {
      // Create with defaults: name="", qty=1, location=null
      await createItem({ userEmail });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newLocationName.trim();
    if (!name) return;

    setIsAddingLocation(true);
    try {
      await createLocation({ name, userEmail });
      setNewLocationName("");
      setIsLocationDialogOpen(false);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsAddingLocation(false);
    }
  };

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
    onSearchChange("");
  }, [onSearchChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(localSearch);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 w-full sm:max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search items..."
          className="w-full pl-9 pr-8 py-2 text-sm
                     bg-surface border border-border rounded-lg
                     text-foreground placeholder:text-text-muted
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                     transition-colors duration-200"
          aria-label="Search inventory"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded
                       text-text-muted hover:text-foreground
                       focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Location filter */}
      <select
        value={locationFilter}
        onChange={(e) =>
          onLocationFilterChange(e.target.value as "all" | "none" | Id<"locations">)
        }
        className="w-full sm:w-auto px-3 py-2 text-sm
                   bg-surface border border-border rounded-lg
                   text-foreground
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                   transition-colors duration-200
                   appearance-none cursor-pointer
                   bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a0a0a0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')]
                   bg-[length:0.65em] bg-[right_0.75rem_center] bg-no-repeat pr-8"
        aria-label="Filter by location"
      >
        <option value="all">All locations</option>
        {locations.map((loc) => (
          <option key={loc._id} value={loc._id}>
            {loc.name}
          </option>
        ))}
      </select>

      <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
        {/* Add Item button */}
        <Button onClick={handleAddItem} isLoading={isAdding} className="w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </Button>

        {/* Add Location button */}
        <Button
          onClick={() => setIsLocationDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Add Location
        </Button>
      </div>

      <Dialog
        title="Add New Location"
        isOpen={isLocationDialogOpen}
        onClose={() => setIsLocationDialogOpen(false)}
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <Input
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="Location Name"
            autoFocus
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLocationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isAddingLocation} disabled={!newLocationName.trim()}>
              Add
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

