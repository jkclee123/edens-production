import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthorizedUser } from "./_auth";

/**
 * List all active locations
 * 
 * Note: This query is protected by Next.js middleware.
 * If Convex Auth is configured, it also verifies the user's identity.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Check authorization (doesn't throw if no Convex Auth identity)
    await requireAuthorizedUser(ctx);

    return await ctx.db
      .query("locations")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Get a location by ID
 */
export const getById = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new location
 */
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);

    const name = args.name.trim();
    if (!name) {
      throw new Error("Location name cannot be empty");
    }

    return await ctx.db.insert("locations", {
      name,
      createdAt: Date.now(),
      isActive: true,
    });
  },
});

/**
 * Update a location
 */
export const update = mutation({
  args: {
    id: v.id("locations"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);

    const name = args.name.trim();
    if (!name) {
      throw new Error("Location name cannot be empty");
    }

    await ctx.db.patch(args.id, { name });
  },
});

/**
 * Soft delete a location
 */
export const remove = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    await ctx.db.patch(args.id, { isActive: false });
  },
});

