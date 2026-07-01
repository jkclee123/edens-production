"use client";

import { useRef } from "react";
import {
  formatReminderDate,
  reminderDateToInputValue,
  inputValueToReminderDate,
} from "@/lib/types/todos";

interface DatePickerProps {
  value: number | undefined;
  onChange: (value: number | null) => void;
  isToday?: boolean;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  isToday,
  disabled,
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValue = reminderDateToInputValue(value);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      const ts = inputValueToReminderDate(newValue);
      onChange(ts ?? null);
    } else {
      onChange(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.focus()}
        className={`relative rounded px-2 py-1 text-xs transition-colors ${
          isToday
            ? "bg-warning/20 font-bold text-warning"
            : value
              ? "text-foreground/80"
              : "text-text-muted"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {value ? formatReminderDate(value) : "—"}
        <input
          ref={inputRef}
          type="date"
          value={inputValue}
          onChange={handleDateChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="提醒日期"
        />
      </button>
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="ml-1 text-xs text-text-muted transition-colors hover:text-error"
          title="清除日期"
        >
          ✕
        </button>
      )}
    </div>
  );
}