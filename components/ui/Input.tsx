"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  description?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, description, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
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
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            [error && errorId, description && descriptionId]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`
            w-full px-3 py-2 text-sm
            bg-surface border rounded-lg
            text-foreground placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-error" : "border-border"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

