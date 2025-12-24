import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthorizedUser, requireUserForMutation, normalizeEmail } from "./_auth";
import { Doc, Id } from "./_generated/dataModel";

/**
 * List active inventory items with optional search and location filter
 * Returns items grouped by location, with "No location" items first
 * 
 * Location ordering follows per-user preferences (FR-010, FR-011, FR-012):
 * 1. "No location" group always appears FIRST
 * 2. Locations with user-set order values are sorted by order (ascending)
 * 3. Locations without order values appear after ordered locations, sorted by name
 */
export const list = query({
  args: {
    search: v.optional(v.string()),
    locationId: v.optional(v.union(v.id("locations"), v.literal("none"), v.literal("all"))),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authResult = await requireAuthorizedUser(ctx);

    // Regular query with isActive filter
    let items = await ctx.db
      .query("inventory")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Apply free-text substring search if provided
    if (args.search && args.search.trim()) {
      const searchStr = args.search.trim().toLowerCase();
      items = items.filter((item) => 
        item.name.toLowerCase().includes(searchStr)
      );
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

    // Get user's location order preferences
    let userId: Id<"users"> | null = null;
    if (authResult?.user) {
      userId = authResult.user._id;
    } else if (args.userEmail) {
      const normalized = normalizeEmail(args.userEmail);
      const user = await ctx.db
        .query("users")
        .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
        .first();
      if (user) {
        userId = user._id;
      }
    }

    // Get location orders for this user
    const locationOrders = userId
      ? await ctx.db
          .query("locationOrders")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect()
      : [];

    // Build order map: locationId -> order value
    const orderMap = new Map<string, number>();
    for (const lo of locationOrders) {
      orderMap.set(lo.locationId, lo.order);
    }

    // Group items by location
    const grouped: Map<string, { location: Doc<"locations"> | null; items: Doc<"inventory">[]; order: number | null }> =
      new Map();

    // Initialize "No location" group (will always be first)
    grouped.set("none", { location: null, items: [], order: null });

    // Initialize groups for all locations
    for (const loc of locations) {
      grouped.set(loc._id, { 
        location: loc, 
        items: [],
        order: orderMap.get(loc._id) ?? null
      });
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

    // Build a map of normalized email to current display names
    const uniqueEmails = [...new Set(items.map((item) => normalizeEmail(item.updatedByEmail)))];
    const usersByEmail = await Promise.all(
      uniqueEmails.map((email) =>
        ctx.db
          .query("users")
          .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", email))
          .first()
      )
    );
    const currentNameMap = new Map<string, string>();
    for (const user of usersByEmail) {
      if (user) {
        currentNameMap.set(user.normalizedEmail, user.name);
      }
    }

    // Helper to get current display name for an item
    const getCurrentName = (item: Doc<"inventory">): string => {
      const normalized = normalizeEmail(item.updatedByEmail);
      return currentNameMap.get(normalized) ?? "";
    };

    // Type for items with current display name
    type ItemWithCurrentName = Doc<"inventory"> & { updatedByCurrentName: string };

    // Convert to array and sort per user preferences
    const result: { location: Doc<"locations"> | null; items: ItemWithCurrentName[]; order: number | null }[] = [];

    // Add "No location" group first (FR-010: always first)
    const noLocationGroup = grouped.get("none")!;
    result.push({
      ...noLocationGroup,
      items: noLocationGroup.items.map((item) => ({
        ...item,
        updatedByCurrentName: getCurrentName(item),
      })),
    });

    // Sort location groups by user preferences (FR-011, FR-012)
    const locationGroups = [...grouped.entries()]
      .filter(([key]) => key !== "none")
      .map(([, group]) => group)
      .sort((a, b) => {
        const orderA = a.order;
        const orderB = b.order;

        // Both have order values: sort by order ascending
        if (orderA !== null && orderB !== null) {
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          // Tie-breaker: location name
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
      })
      .map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          updatedByCurrentName: getCurrentName(item),
        })),
      }));

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
    userEmail: v.optional(v.string()), // Passed from client session
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

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
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    const item = await ctx.db.get(args.id);
    if (!item || !item.isActive) {
      throw new Error("Inventory item not found");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
      updatedByUserId: user._id,
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
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

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
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

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
      updatedByEmail: user.email,
    });
  },
});

/**
 * Soft delete an inventory item (set isActive=false)
 */
export const remove = mutation({
  args: {
    id: v.id("inventory"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

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
      updatedByEmail: user.email,
    });
  },
});

