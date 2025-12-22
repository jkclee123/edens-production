"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface LocationSelectCellProps {
  id: Id<"inventory">;
  locationId: Id<"locations"> | undefined;
  locations: Doc<"locations">[];
}

export function LocationSelectCell({ id, locationId, locations }: LocationSelectCellProps) {
  const [isPending, setIsPending] = useState(false);
  const updateLocation = useMutation(api.inventory.updateLocation);
  const userEmail = useUserEmail();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newLocationId = value === "" ? undefined : (value as Id<"locations">);

    if (newLocationId === locationId) {
      return;
    }

    setIsPending(true);
    try {
      await updateLocation({ id, locationId: newLocationId, userEmail });
    } catch (error) {
      console.error("Failed to update location:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <select
      value={locationId ?? ""}
      onChange={handleChange}
      disabled={isPending}
      className="w-full max-w-[200px] px-2 py-1.5 text-sm
                 bg-surface border border-border rounded
                 text-foreground
                 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-150
                 appearance-none cursor-pointer
                 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a0a0a0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')]
                 bg-[length:0.6em] bg-[right_0.5rem_center] bg-no-repeat pr-7"
      aria-label="Select location"
    >
      <option value="">No location</option>
      {locations.map((loc) => (
        <option key={loc._id} value={loc._id}>
          {loc.name}
        </option>
      ))}
    </select>
  );
}

