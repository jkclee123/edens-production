"use client";

import { useSession } from "next-auth/react";

/**
 * Get the current user's email from the NextAuth session
 * Used for passing to Convex mutations for user tracking
 */
export function useUserEmail() {
  const { data: session } = useSession();
  return session?.user?.email ?? undefined;
}

