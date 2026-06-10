"use client";

import { ReactNode, useMemo } from "react";
import { SessionProvider } from "next-auth/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ToastProvider } from "@/components/ui/Toast";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers
 * 
 * Note: We use ConvexProvider (not ConvexProviderWithAuth) because:
 * - NextAuth handles authentication (login/logout/session)
 * - Next.js middleware protects routes
 * - User identity is passed to Convex mutations via userEmail parameter
 * 
 * For full Convex Auth integration, you would need to:
 * 1. Configure an external JWT provider in the Convex dashboard
 * 2. Use ConvexProviderWithAuth with proper token fetching
 */
export function Providers({ children }: ProvidersProps) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) return null;
    return new ConvexReactClient(url);
  }, []);

  if (!convex) {
    return (
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        <ToastProvider>{children}</ToastProvider>
      </ConvexProvider>
    </SessionProvider>
  );
}

