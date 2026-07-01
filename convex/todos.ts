import {
  query,
  mutation,
  internalQuery,
  internalAction,
  QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import {
  requireAuthorizedUser,
  requireUserForMutation,
  normalizeEmail,
} from "./_auth";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// ============================================================
// Helpers
// ============================================================

/**
 * Resolve current user id from auth or email fallback.
 */
async function getCurrentUserId(
  ctx: { db: QueryCtx["db"] },
  authResult: Awaited<ReturnType<typeof requireAuthorizedUser>>,
  userEmail?: string
): Promise<Id<"users"> | null> {
  if (authResult?.user) return authResult.user._id;

  if (userEmail) {
    const normalized = normalizeEmail(userEmail);
    const user = await ctx.db
      .query("users")
      .withIndex("by_normalizedEmail", (q) =>
        q.eq("normalizedEmail", normalized)
      )
      .first();
    if (user) return user._id;
  }

  return null;
}

/**
 * Build a display-name map for a list of normalized emails.
 */
async function buildNameMap(
  ctx: { db: QueryCtx["db"] },
  emails: string[]
): Promise<Map<string, string>> {
  const uniqueEmails = [...new Set(emails.map(normalizeEmail))];
  const users = await Promise.all(
    uniqueEmails.map((email) =>
      ctx.db
        .query("users")
        .withIndex("by_normalizedEmail", (q) =>
          q.eq("normalizedEmail", email)
        )
        .first()
    )
  );

  const map = new Map<string, string>();
  for (const user of users) {
    if (user) {
      map.set(user.normalizedEmail, user.name);
    }
  }
  return map;
}

/**
 * Enrich a todo with canEdit flag and current creator name.
 */
function enrichTodo(
  todo: Doc<"todos">,
  currentUserId: Id<"users"> | null,
  nameMap: Map<string, string>
): TodoWithMeta {
  return {
    ...todo,
    createdByCurrentName:
      nameMap.get(normalizeEmail(todo.createdByEmail)) ?? "",
    canEdit: currentUserId !== null && todo.createdByUserId === currentUserId,
  };
}

// ============================================================
// Public types returned by queries
// ============================================================

export interface TodoWithMeta extends Doc<"todos"> {
  createdByCurrentName: string;
  canEdit: boolean;
  subtasks?: TodoWithMeta[];
}

// ============================================================
// Queries
// ============================================================

/**
 * List active top-level todos, always grouped by status.
 * Within each status group:
 *   1. Tasks assigned to the current login user sort to top
 *   2. Then createdAt ascending
 */
export const list = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.array(v.string())),
    assigneeId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authResult = await requireAuthorizedUser(ctx);

    // Fetch top-level active todos
    let todos: Doc<"todos">[] = [];
    if (args.search && args.search.trim()) {
      todos = await ctx.db
        .query("todos")
        .withSearchIndex("search_name", (q) =>
          q
            .search("name", args.search!.trim())
            .eq("isActive", true)
            .eq("parentId", undefined)
        )
        .collect();
    } else {
      todos = await ctx.db
        .query("todos")
        .withIndex("by_isActive_parentId", (q) =>
          q.eq("isActive", true).eq("parentId", undefined)
        )
        .order("desc")
        .collect();
    }

    // Fetch subtasks for all top-level todos
    const subtasksByParent = new Map<Id<"todos">, Doc<"todos">[]>();
    await Promise.all(
      todos.map(async (todo) => {
        const subtasks = await ctx.db
          .query("todos")
          .withIndex("by_isActive_parentId", (q) =>
            q.eq("isActive", true).eq("parentId", todo._id)
          )
          .order("desc")
          .collect();
        subtasksByParent.set(todo._id, subtasks);
      })
    );

    // Filter values
    const statusSet = args.status ? new Set(args.status) : null;

    const matchesFilters = (todo: Doc<"todos">) => {
      if (statusSet && !statusSet.has(todo.status)) return false;
      if (args.assigneeId) {
        if (!todo.assigneeId) return false;
        if (todo.assigneeId !== args.assigneeId) return false;
      }
      return true;
    };

    const currentUserId = await getCurrentUserId(ctx, authResult, args.userEmail);

    // Build name map for creators
    const emails = todos.map((t) => t.createdByEmail);
    for (const [, subs] of subtasksByParent) {
      for (const sub of subs) emails.push(sub.createdByEmail);
    }
    const nameMap = await buildNameMap(ctx, emails);

    // Filter top-level todos
    let filtered = todos.filter(matchesFilters);

    // Fixed sorting:
    // - tasks assigned to current login user first
    // - then createdAt ascending
    filtered.sort((a, b) => {
      const aMe = a.assigneeId === currentUserId ? 1 : 0;
      const bMe = b.assigneeId === currentUserId ? 1 : 0;
      if (aMe !== bMe) return bMe - aMe;
      return a.createdAt - b.createdAt;
    });

    // Enrich todos and attach subtasks
    const enriched: TodoWithMeta[] = filtered.map((todo) => {
      const subs = (subtasksByParent.get(todo._id) || [])
        .filter(matchesFilters)
        .map((sub) => enrichTodo(sub, currentUserId, nameMap));

      // Sort subtasks the same way
      subs.sort((a, b) => {
        const aMe = a.assigneeId === currentUserId ? 1 : 0;
        const bMe = b.assigneeId === currentUserId ? 1 : 0;
        if (aMe !== bMe) return bMe - aMe;
        return a.createdAt - b.createdAt;
      });

      return {
        ...enrichTodo(todo, currentUserId, nameMap),
        subtasks: subs,
      };
    });

    // Always group by status (primary UI statuses first; legacy statuses follow)
    const statusOrder = ["NOT_STARTED", "DONE"];
    const groups: Record<string, TodoWithMeta[]> = {};
    for (const todo of enriched) {
      if (!groups[todo.status]) groups[todo.status] = [];
      groups[todo.status].push(todo);
    }

    // Ensure predefined order keys exist for iteration
    for (const status of statusOrder) {
      if (!groups[status]) groups[status] = [];
    }

    return { groups, total: enriched.length };
  },
});

/**
 * Get a single todo by ID, including subtasks.
 */
export const getById = query({
  args: {
    id: v.id("todos"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authResult = await requireAuthorizedUser(ctx);
    const todo = await ctx.db.get(args.id);

    if (!todo || !todo.isActive) {
      return null;
    }

    const currentUserId = await getCurrentUserId(ctx, authResult, args.userEmail);
    const nameMap = await buildNameMap(ctx, [todo.createdByEmail]);

    const subtasks = await ctx.db
      .query("todos")
      .withIndex("by_isActive_parentId", (q) =>
        q.eq("isActive", true).eq("parentId", todo._id)
      )
      .order("desc")
      .collect();

    return {
      ...enrichTodo(todo, currentUserId, nameMap),
      subtasks: subtasks.map((sub) =>
        enrichTodo(sub, currentUserId, nameMap)
      ),
    };
  },
});

// ============================================================
// Mutations
// ============================================================

/**
 * Create a new todo / task.
 */
export const create = mutation({
  args: {
    name: v.string(),
    status: v.optional(
      v.union(
        v.literal("NOT_STARTED"),
        v.literal("IN_PROGRESS"),
        v.literal("REVIEW"),
        v.literal("DONE")
      )
    ),
    remarks: v.optional(v.string()),
    reminderDate: v.optional(v.union(v.number(), v.null())),
    assigneeId: v.optional(v.string()),
    parentId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Task name cannot be empty");
    }

    // Resolve assignee if provided
    let assigneeId: Id<"users"> | undefined = undefined;
    let assigneeName: string | undefined = undefined;
    let assigneeImageUrl: string | undefined = undefined;

    if (args.assigneeId) {
      const assignee = await ctx.db.get(args.assigneeId as Id<"users">);
      if (assignee) {
        assigneeId = assignee._id;
        assigneeName = assignee.name;
        assigneeImageUrl = assignee.imageUrl ?? undefined;
      }
    }

    // Validate parent task if provided
    let parentId: Id<"todos"> | undefined = undefined;
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId as Id<"todos">);
      if (!parent || !parent.isActive) {
        throw new Error("Parent task not found");
      }
      parentId = parent._id;
    }

    const now = Date.now();

    const todoId = await ctx.db.insert("todos", {
      name: trimmedName,
      status: args.status ?? "NOT_STARTED",
      remarks: args.remarks?.trim() || undefined,
      reminderDate: args.reminderDate ?? undefined,
      assigneeId,
      assigneeName,
      assigneeImageUrl,
      parentId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdByUserId: user._id,
      createdByEmail: user.email,
    });

    return todoId;
  },
});

/**
 * Update a todo.
 * Only the creator can update.
 */
export const update = mutation({
  args: {
    id: v.id("todos"),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("NOT_STARTED"),
        v.literal("IN_PROGRESS"),
        v.literal("REVIEW"),
        v.literal("DONE")
      )
    ),
    remarks: v.optional(v.string()),
    reminderDate: v.optional(v.union(v.number(), v.null())),
    assigneeId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    const todo = await ctx.db.get(args.id);
    if (!todo || !todo.isActive) {
      throw new Error("Task not found");
    }

    const isCreator = todo.createdByUserId === user._id;
    const editingOtherFields =
      args.name !== undefined ||
      args.status !== undefined ||
      args.remarks !== undefined ||
      args.reminderDate !== undefined;

    // Non-creators may only reassign the assignee
    if (!isCreator && editingOtherFields) {
      throw new Error("You can only edit your own tasks");
    }

    const patch: Partial<Doc<"todos">> = {
      updatedAt: Date.now(),
    };

    if (isCreator) {
      if (args.name !== undefined) {
        const trimmed = args.name.trim();
        if (!trimmed) throw new Error("Task name cannot be empty");
        patch.name = trimmed;
      }
      if (args.status !== undefined) patch.status = args.status;
      if (args.remarks !== undefined) {
        patch.remarks = args.remarks.trim() || undefined;
      }
      if (args.reminderDate !== undefined) {
        patch.reminderDate =
          args.reminderDate == null ? undefined : args.reminderDate;
      }
    }

    // Anyone can reassign
    if (args.assigneeId !== undefined) {
      if (args.assigneeId) {
        const assignee = await ctx.db.get(args.assigneeId as Id<"users">);
        if (assignee) {
          patch.assigneeId = assignee._id;
          patch.assigneeName = assignee.name;
          patch.assigneeImageUrl = assignee.imageUrl ?? undefined;
        }
      } else {
        patch.assigneeId = undefined;
        patch.assigneeName = undefined;
        patch.assigneeImageUrl = undefined;
      }
    }

    await ctx.db.patch(args.id, patch);
    return args.id;
  },
});

/**
 * Soft delete a todo and its subtasks.
 * Only the creator can delete.
 */
export const remove = mutation({
  args: {
    id: v.id("todos"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    const todo = await ctx.db.get(args.id);
    if (!todo) {
      throw new Error("Task not found");
    }

    if (todo.createdByUserId !== user._id) {
      throw new Error("You can only delete your own tasks");
    }

    if (!todo.isActive) return;

    const now = Date.now();

    // Soft delete subtasks
    const subtasks = await ctx.db
      .query("todos")
      .withIndex("by_isActive_parentId", (q) =>
        q.eq("isActive", true).eq("parentId", todo._id)
      )
      .collect();

    await Promise.all(
      subtasks.map((sub) =>
        ctx.db.patch(sub._id, { isActive: false, updatedAt: now })
      )
    );

    await ctx.db.patch(args.id, { isActive: false, updatedAt: now });
  },
});

// ============================================================
// Scheduled reminder email job
// ============================================================

function hongKongTodayRange(): { start: number; end: number } {
  // Asia/Hong_Kong is UTC+8 year-round (no DST).
  const HK_OFFSET_MS = 8 * 60 * 60 * 1000;

  const now = Date.now();
  const hkEpoch = now + HK_OFFSET_MS;
  const hkDayStart = Math.floor(hkEpoch / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
  const start = hkDayStart - HK_OFFSET_MS;
  const end = start + 24 * 60 * 60 * 1000 - 1;
  return { start, end };
}

export const listTodosDueToday = internalQuery({
  args: {},
  handler: async (ctx) => {
    const { start, end } = hongKongTodayRange();

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_isActive_reminderDate", (q) =>
        q
          .eq("isActive", true)
          .gte("reminderDate", start)
          .lte("reminderDate", end)
      )
      .collect();

    const results: Array<{
      todoId: Id<"todos">;
      todoName: string;
      assigneeEmail: string;
    }> = [];

    for (const todo of todos) {
      if (todo.status === "DONE") continue;
      if (!todo.assigneeId) continue;

      const assignee = await ctx.db.get(todo.assigneeId);
      if (!assignee) continue;

      results.push({
        todoId: todo._id,
        todoName: todo.name,
        assigneeEmail: assignee.email,
      });
    }

    return results;
  },
});

export const sendReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const dueToday = await ctx.runQuery(internal.todos.listTodosDueToday, {});

    if (dueToday.length === 0) {
      return { sent: 0 };
    }

    // Group todo names by assignee email.
    const byEmail = new Map<string, string[]>();
    for (const item of dueToday) {
      const list = byEmail.get(item.assigneeEmail) ?? [];
      list.push(item.todoName);
      byEmail.set(item.assigneeEmail, list);
    }

    let sent = 0;
    for (const [email, todoNames] of byEmail) {
      try {
        await ctx.runAction(internal.emails.sendTodoReminder, {
          to: email,
          todoNames,
        });
        sent += 1;
      } catch (err) {
        console.error(
          `Failed to send reminder to ${email}:`,
          err
        );
      }
    }

    return { sent };
  },
});
