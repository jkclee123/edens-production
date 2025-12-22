"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorInfo = (errorCode: string | null) => {
    switch (errorCode) {
      case "not_allowed":
        return {
          title: "Access Denied",
          message:
            "Your email is not authorized to access this application.",
        };
      case "no_email":
        return {
          title: "No Email Found",
          message:
            "We couldn't retrieve your email address from Google. Please try again or use a different account.",
        };
      case "server_error":
        return {
          title: "Server Error",
          message:
            "An error occurred while verifying your access. Please try again later.",
        };
      default:
        return {
          title: "Unauthorized",
          message: "You are not authorized to access this application.",
        };
    }
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        {/* Error icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
          <svg
            className="h-8 w-8 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error message */}
        <h1 className="text-2xl font-bold text-foreground font-display">
          {errorInfo.title}
        </h1>
        <p className="mt-3 text-text-muted">{errorInfo.message}</p>

        {/* Back to login */}
        <p className="mt-8 text-sm text-text-secondary">
          <Link href="/login" className="text-accent hover:underline">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}

