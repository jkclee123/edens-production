"use client";

import { useState, useEffect } from "react";
import { TodoFilters as TodoFiltersType } from "@/lib/types/todos";

interface TodoFiltersProps {
  filters: TodoFiltersType;
  onFiltersChange: (filters: TodoFiltersType) => void;
}

export function TodoFilters({
  filters,
  onFiltersChange,
}: TodoFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = searchValue.trim() || undefined;
      if (nextSearch !== filters.search) {
        onFiltersChange({ ...filters, search: nextSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
          placeholder="搜尋任務..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-32 sm:w-48 rounded-lg border border-border bg-surface py-1.5 sm:py-2 pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>
    </div>
  );
}