import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { normalizeEmail, requireAuthorizedUser, requireUserForMutation } from "./_auth";

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
        // Don't overwrite manually edited name with Google name
        name: existing.name || args.name,
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
 * Update user display name
 */
export const updateName = mutation({
  args: {
    name: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);
    const trimmedName = args.name.trim();
    
    if (!trimmedName) {
      throw new Error("Name cannot be empty");
    }

    await ctx.db.patch(user._id, {
      name: trimmedName,
    });
  },
});

/**
 * Get current user profile
 */
export const getCurrent = query({
  args: {
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authResult = await requireAuthorizedUser(ctx);
    if (authResult.user) return authResult.user;

    if (args.userEmail) {
      const normalized = normalizeEmail(args.userEmail);
      return await ctx.db
        .query("users")
        .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
        .first();
    }

    return null;
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



