"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface NoticeWithEdit extends Doc<"notices"> {
  canEdit: boolean;
}

interface NoticeCardProps {
  notice: NoticeWithEdit;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(notice.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateNotice = useMutation(api.notices.update);
  const deleteNotice = useMutation(api.notices.remove);
  const userEmail = useUserEmail();

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: days > 365 ? "numeric" : undefined,
      });
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleStartEdit = useCallback(() => {
    setEditContent(notice.content);
    setIsEditing(true);
    setError(null);
  }, [notice.content]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(notice.content);
    setError(null);
  }, [notice.content]);

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      setError("Notice content cannot be empty");
      return;
    }

    if (trimmed === notice.content) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await updateNotice({ id: notice._id, content: trimmed, userEmail });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update notice");
    } finally {
      setIsUpdating(false);
    }
  }, [editContent, notice._id, notice.content, updateNotice, userEmail]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteNotice({ id: notice._id, userEmail });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notice");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  }, [notice._id, deleteNotice, userEmail]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancelEdit();
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSaveEdit();
    }
  }, [handleCancelEdit, handleSaveEdit]);

  const isEdited = notice.updatedAt > notice.createdAt;

  return (
    <article className="card animate-fade-in">
      {/* Header with author info and actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-accent">
              {notice.createdByName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {notice.createdByName}
            </p>
            <p className="text-xs text-text-muted">
              {formatRelativeTime(notice.createdAt)}
              {isEdited && (
                <span className="ml-1 text-text-secondary">(edited)</span>
              )}
            </p>
          </div>
        </div>

        {/* Actions - only show for creator */}
        {notice.canEdit && !isEditing && !showDeleteConfirm && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleStartEdit}
              className="p-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-surface transition-colors"
              aria-label="Edit notice"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10 transition-colors"
              aria-label="Delete notice"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content - view or edit mode */}
      {isEditing ? (
        <div className="space-y-3" onKeyDown={handleKeyDown}>
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            className="w-full px-3 py-2 text-sm
                       bg-surface border border-border rounded-lg
                       text-foreground placeholder:text-text-muted
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                       transition-colors duration-200 resize-y min-h-[80px]"
            aria-label="Edit notice content"
            disabled={isUpdating}
          />
          
          {error && (
            <p className="text-sm text-error animate-fade-in">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveEdit}
              isLoading={isUpdating}
              disabled={!editContent.trim()}
            >
              Save
            </Button>
          </div>
          <p className="text-xs text-text-secondary">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface text-text-muted">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-surface text-text-muted">Enter</kbd> to save, <kbd className="px-1.5 py-0.5 rounded bg-surface text-text-muted">Esc</kbd> to cancel
          </p>
        </div>
      ) : showDeleteConfirm ? (
        <div className="space-y-3">
          <p className="text-sm text-foreground">
            Are you sure you want to delete this notice? This action cannot be undone.
          </p>
          
          {error && (
            <p className="text-sm text-error animate-fade-in">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {notice.content}
        </p>
      )}
    </article>
  );
}

