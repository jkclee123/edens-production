"use client";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loading({ message, size = "md" }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-border border-t-accent`}
      />
      {message && <p className="text-sm text-text-muted">{message}</p>}
    </div>
  );
}

export function LoadingPage({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading message={message} size="lg" />
    </div>
  );
}

export function LoadingInline() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
    </span>
  );
}

