"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ToastProvider } from "@/components/ui/Toast";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        <ToastProvider>{children}</ToastProvider>
      </ConvexProvider>
    </SessionProvider>
  );
}

