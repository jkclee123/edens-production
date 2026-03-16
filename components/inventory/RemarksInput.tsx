"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface RemarksInputProps {
  id: Id<"inventory">;
  remarks: string;
}

export function RemarksInput({ id, remarks }: RemarksInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(remarks);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateRemarks = useMutation(api.inventory.updateRemarks);
  const userEmail = useUserEmail();

  useEffect(() => {
    if (!isEditing) {
      setValue(remarks);
    }
  }, [remarks, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value === remarks) {
      setIsEditing(false);
      return;
    }

    setIsPending(true);
    try {
      await updateRemarks({ id, remarks: value, userEmail });
    } catch (error) {
      setValue(remarks);
      console.error("Failed to update remarks:", error);
    } finally {
      setIsPending(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setValue(remarks);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        placeholder="備註"
        className="w-full px-2 py-1 text-sm bg-surface border border-accent rounded
                   text-foreground placeholder:text-text-muted
                   focus:outline-none focus:ring-1 focus:ring-accent
                   disabled:opacity-50"
        aria-label="Item remarks"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full text-left px-2 py-1 -mx-2 -my-1 rounded
                 hover:bg-surface-elevated focus:outline-none focus:ring-1 focus:ring-accent
                 transition-colors duration-150 cursor-text text-sm"
      aria-label={`Edit remarks: ${remarks || "(empty)"}`}
    >
      {remarks || <span className="text-text-muted italic">備註</span>}
    </button>
  );
}
