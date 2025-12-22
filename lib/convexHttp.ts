import { ConvexHttpClient } from "convex/browser";

/**
 * Server-side Convex HTTP client
 * Use this for server actions and API routes
 */
export function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  return new ConvexHttpClient(url);
}


