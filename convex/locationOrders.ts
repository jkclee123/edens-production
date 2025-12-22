import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthorizedUser, requireUserForMutation, normalizeEmail } from "./_auth";
import { Doc, Id } from "./_generated/dataModel";

/**
 * List all locations with the current user's order settings
 * Returns all active locations with their order value (or null if not set)
 */
export const listWithOrders = query({
  args: {
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);

    // Get all active locations
    const locations = await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get the user's location orders
    let userId: Id<"users"> | null = null;
    
    // Try to get user from Convex Auth
    const authResult = await requireAuthorizedUser(ctx);
    if (authResult?.user) {
      userId = authResult.user._id;
    } else if (args.userEmail) {
      // Fallback: look up user by email
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

    // Create a map of locationId -> order
    const orderMap = new Map<string, number>();
    for (const lo of locationOrders) {
      orderMap.set(lo.locationId, lo.order);
    }

    // Return locations with their order values
    const result: {
      location: Doc<"locations">;
      order: number | null;
    }[] = locations
      .map((location) => ({
        location,
        order: orderMap.get(location._id) ?? null,
      }))
      .sort((a, b) => {
        // Sort by name for consistent display
        return a.location.name.toLowerCase().localeCompare(b.location.name.toLowerCase());
      });

    return result;
  },
});

/**
 * Upsert a location order for the current user
 * If the row exists, update it; otherwise create it
 */
export const upsert = mutation({
  args: {
    locationId: v.id("locations"),
    order: v.number(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    // Validate order is an integer
    if (!Number.isInteger(args.order)) {
      throw new Error("Order must be an integer");
    }

    // Validate location exists
    const location = await ctx.db.get(args.locationId);
    if (!location || !location.isActive) {
      throw new Error("Location not found");
    }

    const now = Date.now();

    // Check if an order already exists for this user+location
    const existing = await ctx.db
      .query("locationOrders")
      .withIndex("by_userId_locationId", (q) =>
        q.eq("userId", user._id).eq("locationId", args.locationId)
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        order: args.order,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("locationOrders", {
        userId: user._id,
        locationId: args.locationId,
        order: args.order,
        updatedAt: now,
      });
    }
  },
});

/**
 * Remove a location order for the current user
 * This sets the order back to null (by deleting the row)
 */
export const remove = mutation({
  args: {
    locationId: v.id("locations"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    // Find the existing order
    const existing = await ctx.db
      .query("locationOrders")
      .withIndex("by_userId_locationId", (q) =>
        q.eq("userId", user._id).eq("locationId", args.locationId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

