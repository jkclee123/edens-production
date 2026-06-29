"use client";

import { TodoStatus, TodoStatusLabels, TodoStatusBadgeClasses } from "@/lib/types/todos";
import { Dropdown } from "./Dropdown";

interface StatusDropdownProps {
  value: TodoStatus;
  onChange: (value: TodoStatus) => void;
  disabled?: boolean;
}

export function StatusDropdown({ value, onChange, disabled }: StatusDropdownProps) {
  return (
    <Dropdown
      className="w-36 py-1"
      trigger={
        <span
          className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${TodoStatusBadgeClasses[value]}`}
        >
          {TodoStatusLabels[value]}
        </span>
      }
    >
      {Object.values(TodoStatus).map((status) => (
        <button
          key={status}
          type="button"
          disabled={disabled}
          onClick={() => onChange(status)}
          className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-surface-elevated ${
            value === status ? "bg-surface-elevated" : ""
          }`}
        >
          <span
            className={`rounded px-2 py-0.5 text-xs ${TodoStatusBadgeClasses[status]}`}
          >
            {TodoStatusLabels[status]}
          </span>
        </button>
      ))}
    </Dropdown>
  );
}
