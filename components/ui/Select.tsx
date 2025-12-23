"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  label?: string;
  placeholder?: string;
  description?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { options, error, label, placeholder, description, className = "", id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const descriptionId = `${selectId}-description`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        {description && (
          <p id={descriptionId} className="text-xs text-text-muted mb-1.5">
            {description}
          </p>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            [error && errorId, description && descriptionId]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`
            w-full px-3 py-2 text-sm
            bg-surface border rounded-lg
            text-foreground
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
            transition-colors duration-200
            cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a0a0a0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')]
            bg-[length:0.65em] bg-[right_0.75rem_center] bg-no-repeat
            pr-8
            ${error ? "border-error" : "border-border"}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

