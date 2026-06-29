"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}

export function Dropdown({
  trigger,
  children,
  className = "",
  align = "left",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleToggle = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = dropdownRef.current?.offsetWidth ?? 0;
      setPosition({
        top: rect.bottom + 4,
        left:
          align === "right"
            ? rect.right - dropdownWidth
            : rect.left,
      });
    }
    setIsOpen((prev) => !prev);
  }, [align]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center"
      >
        {trigger}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`fixed z-[9999] rounded-xl border border-border bg-surface shadow-xl ${className}`}
            style={{ top: position.top, left: position.left }}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
}
