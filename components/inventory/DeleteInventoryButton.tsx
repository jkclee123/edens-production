"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface DeleteInventoryButtonProps {
  id: Id<"inventory">;
  name: string;
}

export function DeleteInventoryButton({ id, name }: DeleteInventoryButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const removeItem = useMutation(api.inventory.remove);
  const userEmail = useUserEmail();

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await removeItem({ id, userEmail });
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsPending(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 animate-fade-in">
        <span className="text-xs text-text-muted whitespace-nowrap">Delete?</span>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          isLoading={isPending}
          className="px-2 py-1 text-xs"
        >
          Yes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="px-2 py-1 text-xs"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error/10
                 focus:outline-none focus:ring-1 focus:ring-error
                 transition-colors duration-150"
      aria-label={`Delete ${name || "item"}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
}

