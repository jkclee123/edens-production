import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthorizedUser, requireUserForMutation, normalizeEmail } from "./_auth";
import { Doc, Id } from "./_generated/dataModel";

/**
 * List active notices, newest-first, with optional search
 * Returns notices with canEdit flag based on current user ownership
 */
export const list = query({
  args: {
    search: v.optional(v.string()),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authResult = await requireAuthorizedUser(ctx);

    let notices: Doc<"notices">[];

    // Use search index if search query provided
    if (args.search && args.search.trim()) {
      notices = await ctx.db
        .query("notices")
        .withSearchIndex("search_content", (q) => {
          let query = q.search("content", args.search!.trim());
          query = query.eq("isActive", true);
          return query;
        })
        .collect();
      
      // Sort by createdAt descending (search results may not be ordered)
      notices.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      // Regular query with isActive filter, newest-first
      notices = await ctx.db
        .query("notices")
        .withIndex("by_isActive_createdAt", (q) => q.eq("isActive", true))
        .order("desc")
        .collect();
    }

    // Determine current user ID for canEdit check
    let currentUserId: Id<"users"> | null = null;
    if (authResult?.user) {
      currentUserId = authResult.user._id;
    } else if (args.userEmail) {
      const normalized = normalizeEmail(args.userEmail);
      const user = await ctx.db
        .query("users")
        .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
        .first();
      if (user) {
        currentUserId = user._id;
      }
    }

    // Build a map of normalized email to current display names
    const uniqueEmails = [...new Set(notices.map((notice) => normalizeEmail(notice.createdByEmail)))];
    const usersByEmail = await Promise.all(
      uniqueEmails.map((email) =>
        ctx.db
          .query("users")
          .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", email))
          .first()
      )
    );
    const currentNameMap = new Map<string, string>();
    for (const user of usersByEmail) {
      if (user) {
        currentNameMap.set(user.normalizedEmail, user.name);
      }
    }

    // Helper to get current display name for a notice
    const getCurrentName = (notice: Doc<"notices">): string => {
      const normalized = normalizeEmail(notice.createdByEmail);
      return currentNameMap.get(normalized) ?? notice.createdByName;
    };

    // Return notices with canEdit flag and current display name
    return notices.map((notice) => ({
      ...notice,
      createdByCurrentName: getCurrentName(notice),
      canEdit: currentUserId !== null && notice.createdByUserId === currentUserId,
    }));
  },
});

/**
 * Get a single notice by ID
 */
export const getById = query({
  args: { 
    id: v.id("notices"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authResult = await requireAuthorizedUser(ctx);
    const notice = await ctx.db.get(args.id);
    
    if (!notice || !notice.isActive) {
      return null;
    }

    // Determine current user ID for canEdit check
    let currentUserId: Id<"users"> | null = null;
    if (authResult?.user) {
      currentUserId = authResult.user._id;
    } else if (args.userEmail) {
      const normalized = normalizeEmail(args.userEmail);
      const user = await ctx.db
        .query("users")
        .withIndex("by_normalizedEmail", (q) => q.eq("normalizedEmail", normalized))
        .first();
      if (user) {
        currentUserId = user._id;
      }
    }

    return {
      ...notice,
      canEdit: currentUserId !== null && notice.createdByUserId === currentUserId,
    };
  },
});

/**
 * Create a new notice
 * Content must be non-empty after trimming
 */
export const create = mutation({
  args: {
    content: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Notice content cannot be empty");
    }

    const now = Date.now();

    const noticeId = await ctx.db.insert("notices", {
      content: trimmedContent,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdByUserId: user._id,
      createdByName: user.name,
      createdByEmail: user.email,
    });

    return noticeId;
  },
});

/**
 * Update a notice's content
 * Only the creator can update their notice
 */
export const update = mutation({
  args: {
    id: v.id("notices"),
    content: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    const notice = await ctx.db.get(args.id);
    if (!notice || !notice.isActive) {
      throw new Error("Notice not found");
    }

    // Check ownership - only creator can edit
    if (notice.createdByUserId !== user._id) {
      throw new Error("You can only edit your own notices");
    }

    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Notice content cannot be empty");
    }

    await ctx.db.patch(args.id, {
      content: trimmedContent,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Soft delete a notice (set isActive=false)
 * Only the creator can delete their notice
 */
export const remove = mutation({
  args: {
    id: v.id("notices"),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUserForMutation(ctx, args.userEmail);

    const notice = await ctx.db.get(args.id);
    if (!notice) {
      throw new Error("Notice not found");
    }

    // Check ownership - only creator can delete
    if (notice.createdByUserId !== user._id) {
      throw new Error("You can only delete your own notices");
    }

    if (!notice.isActive) {
      // Already deleted, no-op
      return;
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

