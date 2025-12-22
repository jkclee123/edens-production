"use client";

import { useState, useEffect, useCallback } from "react";

interface NoticeSearchProps {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export function NoticeSearch({ 
  value, 
  onChange, 
  debounceMs = 300 
}: NoticeSearchProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  return (
    <div className="relative flex-1 w-full sm:max-w-sm">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Search notices..."
        className="w-full pl-9 pr-8 py-2 text-sm
                   bg-surface border border-border rounded-lg
                   text-foreground placeholder:text-text-muted
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                   transition-colors duration-200"
        aria-label="Search notices"
      />
      {localValue && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded
                     text-text-muted hover:text-foreground
                     focus:outline-none focus:ring-1 focus:ring-accent"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

