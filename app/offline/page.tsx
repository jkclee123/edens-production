"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pt-safe pb-safe">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-surface-elevated border border-border flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
            />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">
            You&apos;re Offline
          </h1>
          <p className="text-text-muted">
            Check your internet connection and try again.
          </p>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

