"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { compressImage } from "@/lib/imageCompress";
import type { Id } from "@/convex/_generated/dataModel";

interface PhotoCellProps {
  todoId: Id<"todos">;
  todoName: string;
  photoUrl: string | null;
  userEmail: string | undefined;
  disabled?: boolean;
  onError: (message: string | null) => void;
}

export function PhotoCell({
  todoId,
  todoName,
  photoUrl,
  userEmail,
  disabled,
  onError,
}: PhotoCellProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.todos.generateUploadUrl);
  const setPhoto = useMutation(api.todos.setPhoto);
  const removePhoto = useMutation(api.todos.removePhoto);

  // Close the viewer if the photo disappears (deleted here or by someone else).
  useEffect(() => {
    if (!photoUrl) setIsViewerOpen(false);
  }, [photoUrl]);

  useEffect(() => {
    if (!isViewerOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsViewerOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isViewerOpen]);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // Reset immediately so picking the same file twice still fires onChange.
      e.target.value = "";
      if (!file) return;

      onError(null);
      setIsBusy(true);
      try {
        const blob = await compressImage(file);
        const uploadUrl = await generateUploadUrl({ userEmail });

        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type || "image/jpeg" },
          body: blob,
        });
        if (!res.ok) throw new Error("上載失敗");

        const { storageId } = (await res.json()) as {
          storageId: Id<"_storage">;
        };
        await setPhoto({ id: todoId, storageId, userEmail });
      } catch (err) {
        onError(err instanceof Error ? err.message : "上載失敗");
      } finally {
        setIsBusy(false);
      }
    },
    [generateUploadUrl, setPhoto, todoId, userEmail, onError]
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`真係要刪除任務 ${todoName} 嘅相片？`)) return;

    onError(null);
    setIsBusy(true);
    try {
      await removePhoto({ id: todoId, userEmail });
      setIsViewerOpen(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : "刪除相片失敗");
    } finally {
      setIsBusy(false);
    }
  }, [removePhoto, todoId, userEmail, onError, todoName]);

  const isDisabled = disabled || isBusy;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />

      {isBusy ? (
        <div className="flex h-10 w-10 items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
        </div>
      ) : photoUrl ? (
        <button
          type="button"
          onClick={() => setIsViewerOpen(true)}
          className="block h-10 w-10 overflow-hidden rounded border border-border transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-accent"
          title="檢視相片"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={`${todoName} 相片`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isDisabled}
          className="flex h-10 w-10 items-center justify-center rounded border border-dashed border-border text-text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
          title="上載相片"
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
        </button>
      )}

      {isViewerOpen &&
        photoUrl &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsViewerOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${todoName} 相片`}
              className="flex max-h-full max-w-3xl flex-col gap-3 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={`${todoName} 相片`}
                className="max-h-[75vh] rounded-lg border border-border object-contain"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isDisabled}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-40"
                >
                  更換相片
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDisabled}
                  className="rounded-lg border border-error px-3 py-1.5 text-sm text-error transition-colors hover:bg-error/10 disabled:opacity-40"
                >
                  刪除相片
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-foreground"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
