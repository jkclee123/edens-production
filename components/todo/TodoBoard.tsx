"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import {
  TodoFilters,
  TodoStatus,
  TodoStatusBadgeClasses,
  TodoStatusLabels,
  statusGroupOrder,
} from "@/lib/types/todos";
import { TodoTable } from "./TodoTable";
import { TodoFilters as TodoFiltersComponent } from "./TodoFilters";
import { TodoCreateModal } from "./TodoCreateModal";
import { TodoEmptyState } from "./TodoEmptyState";

const PREF_KEY = "edens-todo-preferences";

const defaultPreferences = {
  filters: {} as TodoFilters,
};

export function TodoBoard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [subtaskParentId, setSubtaskParentId] = useState<string | undefined>(
    undefined
  );
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isHydrated, setIsHydrated] = useState(false);
  const userEmail = useUserEmail();

  // Hydrate preferences from localStorage on client
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREF_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          filters: parsed.filters || {},
        });
      }
    } catch {
      // ignore invalid stored prefs
    }
    setIsHydrated(true);
  }, []);

  // Persist preferences
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(PREF_KEY, JSON.stringify(preferences));
    }
  }, [preferences, isHydrated]);

  const { filters } = preferences;

  const todosResult = useQuery(
    api.todos.list,
    isHydrated
      ? {
          search: filters.search,
          status: filters.status as string[] | undefined,
          userEmail,
        }
      : "skip"
  );

  const handleFiltersChange = useCallback((nextFilters: TodoFilters) => {
    setPreferences((prev) => ({ ...prev, filters: nextFilters }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setPreferences((prev) => ({ ...prev, filters: {} }));
  }, []);

  const handleCreateSubtask = useCallback((parentId: string) => {
    setSubtaskParentId(parentId);
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSubtaskParentId(undefined);
  }, []);

  const isLoading = todosResult === undefined;
  const hasError = todosResult === null;
  const total = todosResult?.total ?? 0;
  const groupedTasks = todosResult?.groups ?? {};
  const flatTasks = Object.values(groupedTasks).flat();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-accent bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          新任務
        </button>

        <TodoFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Loading state */}
      {isLoading && <Loading message="載入任務..." />}

      {/* Error state */}
      {hasError && (
        <ErrorState
          message="載入任務失敗"
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Empty state */}
      {!isLoading && !hasError && total === 0 && (
        <TodoEmptyState filters={filters} onClearFilters={handleClearFilters} />
      )}

      {/* Task list */}
      {!isLoading && !hasError && total > 0 && (
        <div className="space-y-4">
          {statusGroupOrder.map((status) => {
            const groupTasks = groupedTasks[status];
            if (!groupTasks || groupTasks.length === 0) return null;

            return (
              <TodoGroupSection
                key={status}
                status={status}
                count={groupTasks.length}
              >
                <TodoTable
                  todos={groupTasks}
                  onCreateSubtask={handleCreateSubtask}
                />
              </TodoGroupSection>
            );
          })}

          {/* Render any status groups not in predefined order */}
          {Object.entries(groupedTasks)
            .filter(([key]) => !statusGroupOrder.includes(key as TodoStatus))
            .map(([key, groupTasks]) => {
              if (!groupTasks || groupTasks.length === 0) return null;

              return (
                <TodoGroupSection
                  key={key}
                  status={key as TodoStatus}
                  count={groupTasks.length}
                >
                  <TodoTable
                    todos={groupTasks}
                    onCreateSubtask={handleCreateSubtask}
                  />
                </TodoGroupSection>
              );
            })}
        </div>
      )}

      {/* Create modal */}
      <TodoCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        parentId={subtaskParentId}
        todos={flatTasks}
      />
    </div>
  );
}

function TodoGroupSection({
  status,
  count,
  children,
}: {
  status: TodoStatus;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-border">
        <span
          className={`rounded-lg px-3 py-1 text-xs font-medium ${TodoStatusBadgeClasses[status]}`}
        >
          {TodoStatusLabels[status]}
        </span>
        <span className="text-sm text-text-muted">({count})</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
