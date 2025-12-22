import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { normalizeEmail } from "./_auth";

/**
 * Check if an email is in the allowlist
 * Used during sign-in to gate access
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
 * List all allowlisted emails (admin use)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("crewEmails").collect();
  },
});

/**
 * Add an email to the allowlist
 */
export const add = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
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
 */
export const remove = mutation({
  args: { id: v.id("crewEmails") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

