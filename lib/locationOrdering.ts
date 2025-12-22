import { Doc, Id } from "@/convex/_generated/dataModel";

/**
 * Location group with ordering context
 */
export interface LocationGroup {
  location: Doc<"locations"> | null;
  items: Doc<"inventory">[];
  order: number | null;
}

/**
 * Order map from locationId to user's order value
 */
export type LocationOrderMap = Map<string, number>;

/**
 * Sort location groups according to per-user ordering preferences
 *
 * Ordering rules (FR-010, FR-011, FR-012):
 * 1. "No location" group always appears FIRST
 * 2. Locations with user-set order values are sorted by order (ascending)
 * 3. Locations without order values (null) appear after ordered locations
 * 4. Tie-breaker for same order: location name (case-insensitive, ascending)
 * 5. Locations without order: sorted by name (case-insensitive, ascending)
 */
export function sortLocationGroups(
  groups: LocationGroup[],
  orderMap: LocationOrderMap
): LocationGroup[] {
  // Separate "no location" group from location groups
  const noLocationGroup = groups.find((g) => g.location === null);
  const locationGroups = groups.filter((g) => g.location !== null);

  // Sort location groups
  const sortedLocationGroups = [...locationGroups].sort((a, b) => {
    const orderA = a.location ? orderMap.get(a.location._id) ?? null : null;
    const orderB = b.location ? orderMap.get(b.location._id) ?? null : null;

    // Both have order values: sort by order ascending
    if (orderA !== null && orderB !== null) {
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // Tie-breaker: name
      return (a.location?.name ?? "").toLowerCase().localeCompare((b.location?.name ?? "").toLowerCase());
    }

    // Only A has order: A comes first
    if (orderA !== null && orderB === null) {
      return -1;
    }

    // Only B has order: B comes first
    if (orderA === null && orderB !== null) {
      return 1;
    }

    // Neither has order: sort by name
    return (a.location?.name ?? "").toLowerCase().localeCompare((b.location?.name ?? "").toLowerCase());
  });

  // Result: "no location" first, then sorted location groups
  const result: LocationGroup[] = [];
  if (noLocationGroup) {
    result.push(noLocationGroup);
  }
  result.push(...sortedLocationGroups);

  return result;
}

/**
 * Sort items within a group by name (stable ordering)
 * 
 * Rules:
 * - Primary: name ascending (case-insensitive)
 * - Secondary: _id for stability when names match
 */
export function sortItemsWithinGroup(items: Doc<"inventory">[]): Doc<"inventory">[] {
  return [...items].sort((a, b) => {
    const nameCompare = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    if (nameCompare !== 0) return nameCompare;
    return a._id.localeCompare(b._id);
  });
}

/**
 * Build a LocationOrderMap from an array of location order documents
 */
export function buildOrderMap(
  orders: Array<{ locationId: Id<"locations">; order: number }>
): LocationOrderMap {
  const map = new Map<string, number>();
  for (const { locationId, order } of orders) {
    map.set(locationId, order);
  }
  return map;
}

