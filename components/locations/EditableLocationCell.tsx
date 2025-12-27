"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface EditableLocationCellProps {
  id: Id<"locations">;
  name: string;
}

export function EditableLocationCell({ id, name }: EditableLocationCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateLocation = useMutation(api.locations.update);
  const userEmail = useUserEmail();

  // Sync local value with prop when not editing
  useEffect(() => {
    if (!isEditing) {
      setValue(name);
    }
  }, [name, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value === name) {
      setIsEditing(false);
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      setValue(name);
      setIsEditing(false);
      return;
    }

    setIsPending(true);
    try {
      await updateLocation({ id, name: trimmed, userEmail });
    } catch (error) {
      // Revert on error
      setValue(name);
      console.error("Failed to update location name:", error);
    } finally {
      setIsPending(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setValue(name);
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
        placeholder="輸入位置名稱..."
        className="w-full px-2 py-1 text-sm bg-surface border border-accent rounded 
                   text-foreground placeholder:text-text-muted
                   focus:outline-none focus:ring-1 focus:ring-accent
                   disabled:opacity-50"
        aria-label="Location name"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full text-left px-2 py-1 -mx-2 -my-1 rounded
                 hover:bg-surface-elevated focus:outline-none focus:ring-1 focus:ring-accent
                 transition-colors duration-150 cursor-text"
      aria-label={`Edit location: ${name}`}
    >
      {name}
    </button>
  );
}

