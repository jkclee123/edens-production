"use client";

import { TodoFilters } from "@/lib/types/todos";

interface TodoEmptyStateProps {
  filters: TodoFilters;
  onClearFilters?: () => void;
}

export function TodoEmptyState({ filters, onClearFilters }: TodoEmptyStateProps) {
  const hasFilters =
    (filters.status?.length ?? 0) > 0 ||
    !!filters.search;

  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated">
        <svg
          className="h-8 w-8 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>

      <h3 className="mb-2 text-lg font-medium text-foreground">
        {hasFilters ? "無符合篩選條件嘅任務" : "暫無任務"}
      </h3>

      <p className="mb-6 max-w-sm text-sm text-text-muted">
        {hasFilters
          ? "試下調整篩選條件或搜尋關鍵字。"
          : "開始建立第一個任務，追蹤進度並管理工作。"}
      </p>

      {hasFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-elevated"
        >
          清除全部篩選
        </button>
      )}
    </div>
  );
}
