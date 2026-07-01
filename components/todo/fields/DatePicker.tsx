"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatReminderDate, reminderDateToInputValue, inputValueToReminderDate } from "@/lib/types/todos";

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
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
    setIsOpen(true);
    setTimeout(() => inputRef.current?.showPicker?.(), 100);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      const ts = inputValueToReminderDate(newValue);
      onChange(ts ?? null);
    } else {
      onChange(null);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
  };

  const inputValue = reminderDateToInputValue(value);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`rounded px-2 py-1 text-xs transition-colors ${value
          ? "text-foreground/80"
          : "text-text-muted"
          }`}
      >
        {value ? formatReminderDate(value) : "—"}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-9999 rounded-xl border border-border bg-surface p-3 shadow-xl"
            style={{ top: position.top, left: position.left }}
          >
            <input
              ref={inputRef}
              type="date"
              value={inputValue}
              onChange={handleDateChange}
              className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent [color-scheme:dark]"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-surface-elevated"
              >
                清除日期
              </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
