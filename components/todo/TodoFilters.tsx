"use client";

import { useState, useRef, useEffect } from "react";
import {
  TodoStatus,
  TodoFilters as TodoFiltersType,
  TodoStatusLabels,
} from "@/lib/types/todos";

interface TodoFiltersProps {
  filters: TodoFiltersType;
  onFiltersChange: (filters: TodoFiltersType) => void;
}

export function TodoFilters({
  filters,
  onFiltersChange,
}: TodoFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const hasActiveFilters =
    (filters.status?.length ?? 0) > 0 ||
    !!filters.search;

  const toggleStatusFilter = (status: TodoStatus) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({
      ...filters,
      status: updated.length > 0 ? updated : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setSearchValue("");
  };

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

      {/* Filter dropdown */}
      <div className="relative" ref={filterRef}>
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm transition-colors ${
            hasActiveFilters
              ? "border-accent bg-accent/20 text-accent"
              : "border-border bg-surface text-text-muted hover:bg-surface-elevated"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          篩選
          {hasActiveFilters && (
            <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-accent text-xs text-white">
              {(filters.status?.length ?? 0) +
                (filters.search ? 1 : 0)}
            </span>
          )}
        </button>

        {isFilterOpen && (
          <div className="absolute left-0 sm:left-auto sm:right-0 top-full z-50 mt-2 w-56 sm:w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">篩選條件</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-accent hover:text-accent-hover"
                >
                  清除全部
                </button>
              )}
            </div>

            {/* Status filter */}
            <FilterSection label="狀態">
              {Object.values(TodoStatus).map((status) => (
                <FilterCheckbox
                  key={status}
                  label={TodoStatusLabels[status]}
                  checked={filters.status?.includes(status) || false}
                  onChange={() => toggleStatusFilter(status)}
                />
              ))}
            </FilterSection>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors hover:bg-surface-elevated">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border bg-surface text-accent accent-accent focus:ring-accent"
      />
      <span className="text-foreground/80">{label}</span>
    </label>
  );
}
