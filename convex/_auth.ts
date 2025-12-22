import {
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "./_generated/server";
import { Doc } from "./_generated/dataModel";

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
 * Authorization result type
 */
export interface AuthResult {
  identity: Awaited<ReturnType<typeof getUserIdentity>>;
  email: string | null;
  normalizedEmail: string | null;
  user: Doc<"users"> | null;
}

/**
 * Require an authenticated user with an allowlisted email
 * Throws an error if:
 * - User is not authenticated
 * - User's email is not in the crewEmails allowlist
 *
 * Returns the user document if found, or null if user profile doesn't exist yet
 * 
 * NOTE: Currently, Convex Auth is not configured with NextAuth.
 * This function checks if identity is available from Convex Auth.
 * If not, it returns a minimal auth result for protected routes.
 * The Next.js middleware ensures only authenticated users can access protected routes.
 */
export async function requireAuthorizedUser(
  ctx: QueryCtx | MutationCtx
): Promise<AuthResult> {
  const identity = await ctx.auth.getUserIdentity();

  // If Convex Auth is configured and we have an identity, use it
  if (identity?.email) {
    const normalized = normalizeEmail(identity.email);

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
      email: identity.email,
      normalizedEmail: normalized,
      user, // may be null if profile not created yet
    };
  }

  // Fallback: No Convex Auth identity available
  // For protected routes, the Next.js middleware ensures authentication.
  // We return a minimal result to indicate no identity is available.
  // Callers can decide how to handle this.
  return {
    identity: null,
    email: null,
    normalizedEmail: null,
    user: null,
  };
}

/**
 * Strict authorization check for mutations
 * Looks up user by email if Convex Auth identity is not available
 * Returns the user or throws if not found
 * 
 * @param ctx - Mutation context
 * @param userEmail - Email from client session (fallback when no Convex Auth)
 */
export async function requireUserForMutation(
  ctx: MutationCtx,
  userEmail?: string
): Promise<Doc<"users">> {
  // First try to get user from Convex Auth
  const authResult = await requireAuthorizedUser(ctx);
  if (authResult?.user) {
    return authResult.user;
  }

  // Fallback: look up user by email (passed from client session)
  if (userEmail) {
    const normalized = normalizeEmail(userEmail);
    
    // Verify email is in allowlist
    const crewEmail = await ctx.db
      .query("crewEmails")
      .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
      .first();

    if (!crewEmail) {
      throw new Error("Unauthorized: Email not in allowlist");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
      .first();
    
    if (user) {
      return user;
    }
  }

  throw new Error("User profile not found. Please sign in again.");
}

/**
 * Check authorization without throwing
 * Returns auth info if authenticated, null otherwise
 * Use this for queries where you want to gracefully handle unauthenticated state
 */
export async function checkAuthorization(
  ctx: QueryCtx | MutationCtx
): Promise<AuthResult | null> {
  try {
    return await requireAuthorizedUser(ctx);
  } catch {
    return null;
  }
}

