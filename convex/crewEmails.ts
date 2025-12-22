import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { normalizeEmail, requireAuthorizedUser, requireUserForMutation } from "./_auth";

/**
 * Check if an email is in the allowlist
 * Used during sign-in to gate access
 * 
 * NOTE: This is intentionally public (no auth check) because it's called
 * during the sign-in flow before the user is authenticated.
 */
export const isAllowed = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email);
    const crewEmail = await ctx.db
      .query("crewEmails")
      .withIndex("by_normalizedEmail", (q) =>
        q.eq("normalizedEmail", normalized)
      )
      .first();

    return crewEmail !== null;
  },
});

/**
 * List all allowlisted emails
 * Protected - only authorized users can view the allowlist
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Verify user is authorized
    await requireAuthorizedUser(ctx);
    return await ctx.db.query("crewEmails").collect();
  },
});

/**
 * Add an email to the allowlist
 * Protected - only authorized users can modify the allowlist
 */
export const add = mutation({
  args: { 
    email: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user is authorized
    await requireUserForMutation(ctx, args.userEmail);

    const normalized = normalizeEmail(args.email);

    // Check if already exists
    const existing = await ctx.db
      .query("crewEmails")
      .withIndex("by_normalizedEmail", (q) =>
        q.eq("normalizedEmail", normalized)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("crewEmails", {
      email: args.email.trim(),
      normalizedEmail: normalized,
      createdAt: Date.now(),
    });
  },
});

/**
 * Remove an email from the allowlist
 * Protected - only authorized users can modify the allowlist
 */
export const remove = mutation({
  args: { 
    id: v.id("crewEmails"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user is authorized
    await requireUserForMutation(ctx, args.userEmail);
    await ctx.db.delete(args.id);
  },
});

