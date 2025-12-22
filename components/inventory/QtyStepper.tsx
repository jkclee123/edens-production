"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface QtyStepperProps {
  id: Id<"inventory">;
  qty: number;
}

export function QtyStepper({ id, qty }: QtyStepperProps) {
  const [localQty, setLocalQty] = useState(qty);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateQty = useMutation(api.inventory.updateQty);
  const userEmail = useUserEmail();

  // Sync local value with prop
  useEffect(() => {
    if (!isPending) {
      setLocalQty(qty);
    }
  }, [qty, isPending]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveQty = async (newQty: number) => {
    // Validate: must be non-negative integer
    const validQty = Math.max(0, Math.floor(newQty));

    if (validQty === qty) {
      setLocalQty(qty);
      return;
    }

    setIsPending(true);
    setLocalQty(validQty);

    try {
      await updateQty({ id, qty: validQty, userEmail });
    } catch (error) {
      // Revert on error
      setLocalQty(qty);
      console.error("Failed to update quantity:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleIncrement = () => {
    saveQty(localQty + 1);
  };

  const handleDecrement = () => {
    if (localQty > 0) {
      saveQty(localQty - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string while typing
    if (value === "") {
      setLocalQty(0);
      return;
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setLocalQty(parsed);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    saveQty(localQty);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      saveQty(localQty);
    } else if (e.key === "Escape") {
      setLocalQty(qty);
      setIsEditing(false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setLocalQty((prev) => prev + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setLocalQty((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={handleDecrement}
        disabled={isPending || localQty <= 0}
        className="w-7 h-7 flex items-center justify-center rounded
                   bg-surface-elevated border border-border
                   hover:bg-border focus:outline-none focus:ring-1 focus:ring-accent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-150"
        aria-label="Decrease quantity"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={localQty}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className="w-14 h-7 px-2 text-sm text-center font-mono
                     bg-surface border border-accent rounded
                     text-foreground
                     focus:outline-none focus:ring-1 focus:ring-accent
                     disabled:opacity-50
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Quantity"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          className="w-14 h-7 px-2 text-sm text-center font-mono
                     bg-surface border border-border rounded
                     hover:border-accent focus:outline-none focus:ring-1 focus:ring-accent
                     disabled:opacity-50
                     transition-colors duration-150"
          aria-label={`Edit quantity: ${localQty}`}
        >
          {localQty}
        </button>
      )}

      <button
        onClick={handleIncrement}
        disabled={isPending}
        className="w-7 h-7 flex items-center justify-center rounded
                   bg-surface-elevated border border-border
                   hover:bg-border focus:outline-none focus:ring-1 focus:ring-accent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-150"
        aria-label="Increase quantity"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

