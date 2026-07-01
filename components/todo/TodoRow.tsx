"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TodoWithMeta, TodoStatus, isReminderToday } from "@/lib/types/todos";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import { InlineTextInput, StatusCheckbox, DatePicker } from "./fields";

interface TodoRowProps {
  todo: TodoWithMeta;
  onCreateSubtask?: (parentId: string) => void;
  level: number;
}

export function TodoRow({ todo, onCreateSubtask, level }: TodoRowProps) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTodo = useMutation(api.todos.update);
  const deleteTodo = useMutation(api.todos.remove);
  const userEmail = useUserEmail();
  const currentUser = useQuery(api.users.getCurrent, userEmail ? { userEmail } : "skip");

  const isToday = isReminderToday(todo.reminderDate);
  const isAssignedToMe =
    !!currentUser && !!todo.assigneeId && currentUser._id === todo.assigneeId;

  const handleUpdate = useCallback(
    async (updates: Parameters<typeof updateTodo>[0]) => {
      setError(null);
      setIsUpdating(true);
      try {
        await updateTodo({ ...updates, userEmail });
      } catch (err) {
        setError(err instanceof Error ? err.message : "更新失敗");
      } finally {
        setIsUpdating(false);
      }
    },
    [updateTodo, userEmail]
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm("真係要刪除呢個任務？")) return;

    setIsDeleted(true);
    setError(null);
    try {
      await deleteTodo({ id: todo._id, userEmail });
    } catch (err) {
      setError(err instanceof Error ? err.message : "刪除失敗");
      setIsDeleted(false);
    }
  }, [deleteTodo, todo._id, userEmail]);

  if (isDeleted) return null;

  return (
    <>
      <tr
        className={`group transition-colors hover:bg-accent/5 ${
          isToday
            ? "border-l-4 border-warning bg-warning/10"
            : isAssignedToMe
              ? "bg-brand-green/10"
              : ""
        }`}
      >
        {/* Spacer */}
        <td className="px-0 py-1.5"></td>

        {/* Task name */}
        <td
          className="px-1.5 py-1.5"
          style={{ paddingLeft: `${level * 12}px` }}
        >
          <InlineTextInput
            value={todo.name}
            onChange={(value) => handleUpdate({ id: todo._id, name: value })}
            placeholder="任務名稱"
            className="font-semibold"
            disabled={isUpdating || !todo.canEdit}
          />
        </td>

        {/* Remarks */}
        <td className="px-1.5 py-1.5">
          <InlineTextInput
            value={todo.remarks ?? ""}
            onChange={(value) =>
              handleUpdate({ id: todo._id, remarks: value || undefined })
            }
            placeholder="—"
            className="w-full wrap-break-word text-foreground/80"
            disabled={isUpdating || !todo.canEdit}
          />
        </td>

        {/* Assignee */}
        <td className="hidden lg:table-cell px-1.5 py-1.5 whitespace-nowrap">
          {todo.assigneeId ? (
            <span className="text-sm text-foreground/80">
              {todo.assigneeName}
            </span>
          ) : (
            <span className="text-text-muted">—</span>
          )}
        </td>

        {/* Status */}
        <td className="px-1.5 py-1.5 text-center">
          <StatusCheckbox
            value={todo.status as TodoStatus}
            onChange={(value) => handleUpdate({ id: todo._id, status: value })}
            disabled={isUpdating || !todo.canEdit}
          />
        </td>

        {/* Reminder Date */}
        <td className="hidden lg:table-cell px-3 py-1.5">
          <DatePicker
            value={todo.reminderDate}
            onChange={(value) =>
              handleUpdate({ id: todo._id, reminderDate: value })
            }
            isToday={isToday}
            disabled={isUpdating || !todo.canEdit}
          />
        </td>

        {/* Actions */}
        <td className="px-1.5 py-1.5">
          <div className="flex items-center justify-end gap-1">
            {level === 0 && onCreateSubtask && (
              <button
                type="button"
                onClick={() => onCreateSubtask(todo._id)}
                disabled={isUpdating}
                className="rounded p-1 text-text-muted transition-colors hover:bg-surface-elevated hover:text-accent disabled:opacity-40"
                title="新增子任務"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            )}
            {todo.canEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isUpdating}
                className="rounded p-1 text-text-muted transition-colors hover:bg-surface-elevated hover:text-error disabled:opacity-40"
                title="刪除任務"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </td>
      </tr>

      {error && (
        <tr>
          <td colSpan={7} className="px-3 py-2">
            <p className="text-xs text-error animate-fade-in">{error}</p>
          </td>
        </tr>
      )}

      {/* Subtasks are always expanded */}
      {todo.subtasks?.map((subtask) => (
        <TodoRow
          key={subtask._id}
          todo={subtask}
          onCreateSubtask={onCreateSubtask}
          level={level + 1}
        />
      ))}
    </>
  );
}
