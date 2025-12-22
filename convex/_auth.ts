import {
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "./_generated/server";

/**
 * Normalized email for case-insensitive comparison
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Get the current user's identity from Convex auth
 * Returns null if not authenticated
 */
export async function getUserIdentity(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  return await ctx.auth.getUserIdentity();
}

/**
 * Require an authenticated user with an allowlisted email
 * Throws an error if:
 * - User is not authenticated
 * - User's email is not in the crewEmails allowlist
 *
 * Returns the user document if found, or null if user profile doesn't exist yet
 */
export async function requireAuthorizedUser(
  ctx: QueryCtx | MutationCtx
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized: Not authenticated");
  }

  const email = identity.email;
  if (!email) {
    throw new Error("Unauthorized: No email in identity");
  }

  const normalized = normalizeEmail(email);

  // Check if email is in allowlist
  const crewEmail = await ctx.db
    .query("crewEmails")
    .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
    .first();

  if (!crewEmail) {
    throw new Error("Unauthorized: Email not in allowlist");
  }

  // Get user profile if it exists
  const user = await ctx.db
    .query("users")
    .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
    .first();

  return {
    identity,
    email,
    normalizedEmail: normalized,
    user, // may be null if profile not created yet
  };
}

/**
 * Get or create user profile
 * Only call this AFTER verifying the email is allowlisted
 */
export async function getOrCreateUser(
  ctx: MutationCtx,
  email: string,
  name: string,
  imageUrl?: string
) {
  const normalized = normalizeEmail(email);
  const now = Date.now();

  // Try to find existing user
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
    .first();

  if (existingUser) {
    // Update lastSeenAt
    await ctx.db.patch(existingUser._id, {
      lastSeenAt: now,
      name: name || existingUser.name,
      imageUrl: imageUrl ?? existingUser.imageUrl,
    });
    return existingUser;
  }

  // Create new user
  const userId = await ctx.db.insert("users", {
    email,
    normalizedEmail: normalized,
    name: name || email.split("@")[0],
    imageUrl,
    createdAt: now,
    lastSeenAt: now,
  });

  return await ctx.db.get(userId);
}

