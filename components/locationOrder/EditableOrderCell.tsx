"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface EditableOrderCellProps {
  locationId: Id<"locations">;
  currentOrder: number | null;
}

export function EditableOrderCell({ locationId, currentOrder }: EditableOrderCellProps) {
  const [value, setValue] = useState(currentOrder?.toString() ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const userEmail = useUserEmail();

  const upsertOrder = useMutation(api.locationOrders.upsert);
  const removeOrder = useMutation(api.locationOrders.remove);

  // Update local value when prop changes
  useEffect(() => {
    if (!isEditing) {
      setValue(currentOrder?.toString() ?? "");
    }
  }, [currentOrder, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    const trimmed = value.trim();
    
    // If empty, remove the order (set to null)
    if (trimmed === "") {
      if (currentOrder !== null) {
        setIsSaving(true);
        try {
          await removeOrder({ locationId, userEmail });
        } catch (error) {
          console.error("Failed to remove order:", error);
          setValue(currentOrder?.toString() ?? "");
        } finally {
          setIsSaving(false);
        }
      }
      setIsEditing(false);
      return;
    }

    // Validate it's an integer
    const parsed = parseInt(trimmed, 10);
    if (isNaN(parsed) || parsed.toString() !== trimmed) {
      // Invalid input, revert
      setValue(currentOrder?.toString() ?? "");
      setIsEditing(false);
      return;
    }

    // Only save if value changed
    if (parsed !== currentOrder) {
      setIsSaving(true);
      try {
        await upsertOrder({ locationId, order: parsed, userEmail });
      } catch (error) {
        console.error("Failed to save order:", error);
        setValue(currentOrder?.toString() ?? "");
      } finally {
        setIsSaving(false);
      }
    }

    setIsEditing(false);
  }, [value, currentOrder, locationId, userEmail, upsertOrder, removeOrder]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setValue(currentOrder?.toString() ?? "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className="w-20 px-2 py-1 text-sm text-center
                   bg-background border border-accent rounded
                   text-foreground
                   focus:outline-none focus:ring-2 focus:ring-accent
                   disabled:opacity-50"
        placeholder="—"
        aria-label="Location order"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-20 px-2 py-1 text-sm text-center rounded
                 bg-surface border border-border
                 text-foreground
                 hover:border-accent hover:bg-surface-hover
                 focus:outline-none focus:ring-2 focus:ring-accent
                 transition-colors duration-150"
      aria-label={`Edit order for location (current: ${currentOrder ?? "not set"})`}
    >
      {currentOrder !== null ? (
        <span className="font-medium">{currentOrder}</span>
      ) : (
        <span className="text-text-muted">—</span>
      )}
    </button>
  );
}

