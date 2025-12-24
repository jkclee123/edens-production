"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface DeleteInventoryButtonProps {
  id: Id<"inventory">;
  name: string;
}

export function DeleteInventoryButton({ id, name }: DeleteInventoryButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const removeItem = useMutation(api.inventory.remove);
  const userEmail = useUserEmail();

  const handleDelete = async () => {
    if (!window.confirm(`真係要刪除 "${name}"？`)) {
      return;
    }

    setIsPending(true);
    try {
      await removeItem({ id, userEmail });
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error/10
                 focus:outline-none focus:ring-1 focus:ring-error
                 transition-colors duration-150 disabled:opacity-50"
      aria-label={`Delete ${name || "item"}`}
    >
      {isPending ? (
        <svg
          className="animate-spin h-4 w-4 text-error"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
    </button>
  );
}
