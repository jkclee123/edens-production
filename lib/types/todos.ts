import { z } from "zod";
import { Doc } from "@/convex/_generated/dataModel";

// ============================================================
// Enums
// ============================================================

export enum TodoStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

export enum TodoPriority {
  CRITICAL = "CRITICAL",
  URGENT = "URGENT",
  MEDIUM_URGENT = "MEDIUM_URGENT",
  LOW = "LOW",
}

// ============================================================
// Types
// ============================================================

export interface TodoWithMeta extends Doc<"todos"> {
  createdByCurrentName: string;
  canEdit: boolean;
  canDelete: boolean;
  /** Signed serving URL for the attached photo, or null when there is none. */
  photoUrl: string | null;
}

export interface TodoFilters {
  status?: TodoStatus[];
  search?: string;
}

export interface TodoListResponse {
  groups: Record<string, TodoWithMeta[]>;
  total: number;
}

// ============================================================
// Labels
// ============================================================

export const TodoStatusLabels: Record<TodoStatus, string> = {
  [TodoStatus.NOT_STARTED]: "未開始",
  [TodoStatus.IN_PROGRESS]: "進行中",
  [TodoStatus.REVIEW]: "審核中",
  [TodoStatus.DONE]: "已完成",
};

export const TodoPriorityLabels: Record<TodoPriority, string> = {
  [TodoPriority.CRITICAL]: "危殆",
  [TodoPriority.URGENT]: "緊急",
  [TodoPriority.MEDIUM_URGENT]: "次緊急",
  [TodoPriority.LOW]: "唔急",
};

// ============================================================
// Badge colors (adapted to edens-production palette)
// ============================================================

export const TodoStatusBadgeClasses: Record<TodoStatus, string> = {
  [TodoStatus.NOT_STARTED]: "bg-surface-elevated text-text-muted",
  [TodoStatus.IN_PROGRESS]: "bg-accent/30 text-foreground",
  [TodoStatus.REVIEW]: "bg-warning/30 text-foreground",
  [TodoStatus.DONE]: "bg-success/30 text-foreground",
};

export const TodoPriorityClasses: Record<TodoPriority, string> = {
  [TodoPriority.CRITICAL]: "text-[#9B30FF] font-bold",
  [TodoPriority.URGENT]: "text-error font-bold",
  [TodoPriority.MEDIUM_URGENT]: "text-warning font-bold",
  [TodoPriority.LOW]: "text-success font-bold",
};

/** Lower number = higher priority. Unset ranks last. */
export const TodoPriorityOrder: Record<TodoPriority, number> = {
  [TodoPriority.CRITICAL]: 0,
  [TodoPriority.URGENT]: 1,
  [TodoPriority.MEDIUM_URGENT]: 2,
  [TodoPriority.LOW]: 3,
};

export function getTodoPriorityRank(priority: string | undefined): number {
  if (priority && priority in TodoPriorityOrder) {
    return TodoPriorityOrder[priority as TodoPriority];
  }
  return 4;
}

// ============================================================
// Validation
// ============================================================

export const todoName = z
  .string()
  .trim()
  .min(1, "Task name cannot be empty")
  .max(500, "Task name is too long");

export const todoRemarks = z
  .string()
  .trim()
  .max(2000, "Remarks are too long")
  .optional();

export const createTodoSchema = z.object({
  name: todoName,
  status: z.nativeEnum(TodoStatus).optional(),
  remarks: todoRemarks,
  reminderDate: z.number().optional(),
  assigneeId: z.string().optional(),
  priority: z.nativeEnum(TodoPriority).optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

// ============================================================
// Helpers
// ============================================================

export function isReminderToday(timestamp: number | undefined): boolean {
  if (!timestamp) return false;
  const now = new Date();
  const date = new Date(timestamp);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function formatReminderDate(timestamp: number | undefined): string {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("zh-HK", {
    month: "short",
    day: "numeric",
  });
}

export function reminderDateToInputValue(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function inputValueToReminderDate(value: string): number | undefined {
  if (!value) return undefined;
  return new Date(`${value}T23:59:59.999`).getTime();
}

export const statusGroupOrder = [TodoStatus.NOT_STARTED, TodoStatus.DONE];

export function getStatusGroupLabel(status: string): string {
  return TodoStatusLabels[status as TodoStatus] || status;
}
