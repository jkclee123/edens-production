"use client";

import { useState, useRef, useEffect } from "react";

interface InlineTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function InlineTextInput({
  value,
  onChange,
  placeholder = "",
  className = "",
  disabled = false,
}: InlineTextInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded bg-surface-elevated px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-accent ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && setIsEditing(true)}
      disabled={disabled}
      className={`w-full rounded px-2 py-1 text-left transition-colors ${className} ${
        value ? "text-foreground" : "text-text-muted"
      } ${disabled ? "cursor-not-allowed opacity-60" : "hover:bg-surface-elevated/50"}`}
    >
      {value || placeholder}
    </button>
  );
}
