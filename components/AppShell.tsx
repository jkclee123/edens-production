"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Nav } from "./Nav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isUserMenuOpen) {
        setIsUserMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isUserMenuOpen]);

  // Focus trap in dropdown menu
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!menuRef.current) return;
    
    const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header role="banner" className="flex h-14 shrink-0 items-center justify-between px-4">
        {/* Left: Menu toggle */}
        <button
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-elevated hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={isNavCollapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!isNavCollapsed}
          aria-controls="main-navigation"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Center: Logo */}
        <Link
          href="/inventory"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
        >
          <span className="text-lg font-semibold text-foreground font-display">
            Eden&apos;s Production
          </span>
        </Link>

        {/* Right: Settings */}
        <div className="relative">
          <button
            ref={menuButtonRef}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-elevated hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* User dropdown menu */}
          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div 
                ref={menuRef}
                role="menu"
                aria-label="User settings"
                onKeyDown={handleMenuKeyDown}
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-surface-elevated p-2 shadow-lg animate-slide-down"
              >
                {session?.user && (
                  <div className="border-b border-border px-3 py-2 mb-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {session.user.email}
                    </p>
                  </div>
                )}

                <Link
                  href="/settings/location-order"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-surface transition-colors focus:outline-none focus-visible:bg-surface focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <svg
                    className="h-4 w-4 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  Location Order Settings
                </Link>

                <button
                  role="menuitem"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-error hover:bg-surface transition-colors focus:outline-none focus-visible:bg-surface focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          id="main-navigation"
          className={`
            shrink-0 border-border bg-surface transition-all duration-300
            ${isNavCollapsed ? "w-16" : "w-56"}
          `}
        >
          <Nav isCollapsed={isNavCollapsed} />
        </aside>

        {/* Main content */}
        <main role="main" className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

