import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { normalizeEmail, requireAuthorizedUser } from "./_auth";

/**
 * Upsert user profile
 * Only called AFTER successful allowlist check in NextAuth signIn callback
 */
export const upsert = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email);
    const now = Date.now();

    // Check existing
    const existing = await ctx.db
      .query("users")
      .withIndex("by_normalizedEmail", (q) =>
        q.eq("normalizedEmail", normalized)
      )
      .first();

    if (existing) {
      // Update
      await ctx.db.patch(existing._id, {
        lastSeenAt: now,
        name: args.name || existing.name,
        imageUrl: args.imageUrl ?? existing.imageUrl,
      });
      return existing._id;
    }

    // Create
    return await ctx.db.insert("users", {
      email: args.email,
      normalizedEmail: normalized,
      name: args.name || args.email.split("@")[0],
      imageUrl: args.imageUrl,
      createdAt: now,
      lastSeenAt: now,
    });
  },
});

/**
 * Get current user profile
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const { user } = await requireAuthorizedUser(ctx);
    return user;
  },
});

/**
 * Get user by ID
 */
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.get(args.id);
  },
});

