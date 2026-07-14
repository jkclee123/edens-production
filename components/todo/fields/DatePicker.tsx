"use client";

import { useEffect, useRef } from "react";
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
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== inputValue) {
      inputRef.current.value = inputValue;
    }
  }, [inputValue]);
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      const ts = inputValueToReminderDate(newValue);
      onChange(ts ?? null);
    } else {
      onChange(null);
    }
  };

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="relative inline-flex items-center">
      <span
        className={`relative inline-block cursor-pointer rounded px-2 py-1 text-xs transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          isToday
            ? "bg-warning/20 font-bold text-warning"
            : value
              ? "text-foreground/80"
              : "text-text-muted"
        }`}
      >
        {value ? formatReminderDate(value) : "—"}
        <input
          ref={inputRef}
          type="date"
          defaultValue={inputValue}
          onChange={handleDateChange}
          onClick={(e) => {
            if (isIOS) return;
            try {
              e.currentTarget.showPicker?.();
            } catch {}
          }}
          disabled={disabled}
          className="absolute inset-0 h-full w-full opacity-0"
          aria-label="提醒日期"
        />
      </span>
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded text-sm text-text-muted transition-colors hover:text-error"
          title="清除日期"
          aria-label="清除日期"
        >
          ✕
        </button>
      )}
    </div>
  );
}