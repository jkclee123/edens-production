"use client";

import { TodoStatus, TodoStatusLabels } from "@/lib/types/todos";

interface StatusCheckboxProps {
  value: TodoStatus;
  onChange: (value: TodoStatus) => void;
  disabled?: boolean;
}

export function StatusCheckbox({
  value,
  onChange,
  disabled,
}: StatusCheckboxProps) {
  const isFinished = value === TodoStatus.DONE;

  return (
    <input
      type="checkbox"
      checked={isFinished}
      disabled={disabled}
      onChange={(e) =>
        onChange(e.target.checked ? TodoStatus.DONE : TodoStatus.NOT_STARTED)
      }
      title={TodoStatusLabels[value]}
      className={`h-4 w-4 rounded border-border bg-surface text-accent accent-accent focus:ring-accent ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    />
  );
}
