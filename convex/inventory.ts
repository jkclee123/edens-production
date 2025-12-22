import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthorizedUser } from "./_auth";
import { Doc, Id } from "./_generated/dataModel";

/**
 * List active inventory items with optional search and location filter
 * Returns items grouped by location, with "No location" items first
 */
export const list = query({
  args: {
    search: v.optional(v.string()),
    locationId: v.optional(v.union(v.id("locations"), v.literal("none"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);

    let items: Doc<"inventory">[];

    // Use search index if search query provided
    if (args.search && args.search.trim()) {
      const searchResults = await ctx.db
        .query("inventory")
        .withSearchIndex("search_name", (q) => {
          let query = q.search("name", args.search!.trim());
          query = query.eq("isActive", true);
          return query;
        })
        .collect();
      items = searchResults;
    } else {
      // Regular query with isActive filter
      items = await ctx.db
        .query("inventory")
        .withIndex("by_isActive", (q) => q.eq("isActive", true))
        .collect();
    }

    // Apply location filter if specified
    if (args.locationId && args.locationId !== "all") {
      if (args.locationId === "none") {
        items = items.filter((item) => !item.locationId);
      } else {
        items = items.filter((item) => item.locationId === args.locationId);
      }
    }

    // Get all active locations for grouping context
    const locations = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const locationMap = new Map(locations.map((loc) => [loc._id, loc]));

    // Group items by location
    const grouped: Map<string, { location: Doc<"locations"> | null; items: Doc<"inventory">[] }> =
      new Map();

    // Initialize "No location" group (will be first)
    grouped.set("none", { location: null, items: [] });

    // Initialize groups for all locations
    for (const loc of locations) {
      grouped.set(loc._id, { location: loc, items: [] });
    }

    // Assign items to groups
    for (const item of items) {
      const key = item.locationId ?? "none";
      const group = grouped.get(key);
      if (group) {
        group.items.push(item);
      } else {
        // Location might have been deleted; put in "No location" group
        grouped.get("none")!.items.push(item);
      }
    }

    // Sort items within each group by name (stable ordering)
    for (const group of grouped.values()) {
      group.items.sort((a, b) => {
        // Primary: name ascending (case-insensitive)
        const nameCompare = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        if (nameCompare !== 0) return nameCompare;
        // Secondary: creation time (use _id for stability)
        return a._id.localeCompare(b._id);
      });
    }

    // Convert to array: "No location" first, then locations sorted by name
    const result: { location: Doc<"locations"> | null; items: Doc<"inventory">[] }[] = [];

    // Add "No location" group first (even if empty, for UI consistency)
    const noLocationGroup = grouped.get("none")!;
    result.push(noLocationGroup);

    // Add location groups sorted by name
    const locationGroups = [...grouped.entries()]
      .filter(([key]) => key !== "none")
      .map(([, group]) => group)
      .sort((a, b) => {
        if (!a.location || !b.location) return 0;
        return a.location.name.toLowerCase().localeCompare(b.location.name.toLowerCase());
      });

    result.push(...locationGroups);

    return {
      groups: result,
      totalCount: items.length,
    };
  },
});

/**
 * Get a single inventory item by ID
 */
export const getById = query({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new inventory item with default values
 * Per spec: name="", qty=1, locationId=null, isActive=true
 */
export const create = mutation({
  args: {
    name: v.optional(v.string()),
    qty: v.optional(v.number()),
    locationId: v.optional(v.id("locations")),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuthorizedUser(ctx);

    if (!user) {
      throw new Error("User profile not found");
    }

    const now = Date.now();

    // Validate qty if provided
    const qty = args.qty ?? 1;
    if (!Number.isInteger(qty) || qty < 0) {
      throw new Error("Quantity must be a non-negative integer");
    }

    return await ctx.db.insert("inventory", {
      name: args.name ?? "",
      qty,
      locationId: args.locationId,
      isActive: true,
      updatedAt: now,
      updatedByUserId: user._id,
      updatedByName: user.name,
      updatedByEmail: user.email,
    });
  },
});

/**
 * Update inventory item name
 */
export const updateName = mutation({
  args: {
    id: v.id("inventory"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuthorizedUser(ctx);

    if (!user) {
      throw new Error("User profile not found");
    }

    const item = await ctx.db.get(args.id);
    if (!item || !item.isActive) {
      throw new Error("Inventory item not found");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
      updatedByUserId: user._id,
      updatedByName: user.name,
      updatedByEmail: user.email,
    });
  },
});

/**
 * Update inventory item quantity
 */
export const updateQty = mutation({
  args: {
    id: v.id("inventory"),
    qty: v.number(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuthorizedUser(ctx);

    if (!user) {
      throw new Error("User profile not found");
    }

    const item = await ctx.db.get(args.id);
    if (!item || !item.isActive) {
      throw new Error("Inventory item not found");
    }

    if (!Number.isInteger(args.qty) || args.qty < 0) {
      throw new Error("Quantity must be a non-negative integer");
    }

    await ctx.db.patch(args.id, {
      qty: args.qty,
      updatedAt: Date.now(),
      updatedByUserId: user._id,
      updatedByName: user.name,
      updatedByEmail: user.email,
    });
  },
});

/**
 * Update inventory item location
 */
export const updateLocation = mutation({
  args: {
    id: v.id("inventory"),
    locationId: v.optional(v.id("locations")),
  },
  handler: async (ctx, args) => {
    const { user } = await requireAuthorizedUser(ctx);

    if (!user) {
      throw new Error("User profile not found");
    }

    const item = await ctx.db.get(args.id);
    if (!item || !item.isActive) {
      throw new Error("Inventory item not found");
    }

    // Validate location exists if provided
    if (args.locationId) {
      const location = await ctx.db.get(args.locationId);
      if (!location || !location.isActive) {
        throw new Error("Location not found");
      }
    }

    await ctx.db.patch(args.id, {
      locationId: args.locationId,
      updatedAt: Date.now(),
      updatedByUserId: user._id,
      updatedByName: user.name,
      updatedByEmail: user.email,
    });
  },
});

/**
 * Soft delete an inventory item (set isActive=false)
 */
export const remove = mutation({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    const { user } = await requireAuthorizedUser(ctx);

    if (!user) {
      throw new Error("User profile not found");
    }

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    if (!item.isActive) {
      // Already deleted, no-op
      return;
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
      updatedByUserId: user._id,
      updatedByName: user.name,
      updatedByEmail: user.email,
    });
  },
});

