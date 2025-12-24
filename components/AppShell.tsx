"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Nav } from "./Nav";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import logo from "@/app/crew.png";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Fetch current user from Convex to get the updated display name
  const userEmail = useUserEmail();
  const currentUser = useQuery(api.users.getCurrent, { userEmail });

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
    <div className="flex h-screen flex-col bg-background pt-safe">
      {/* Top Bar */}
      <header role="banner" className="relative z-[60] flex h-14 shrink-0 items-center justify-between px-4">
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
              d={isNavCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"}
            />
          </svg>
        </button>

        {/* Center: Logo */}
        <Link
          href="/inventory"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
        >
          <Image
            src={logo}
            alt="Eden's Production"
            width={96}
            height={96}
            priority
            className="object-contain"
          />
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
                      {currentUser?.name ?? session.user.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {session.user.email}
                    </p>
                  </div>
                )}

                <Link
                  href="/settings/profile"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  帳戶
                </Link>

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
                  位置排序
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
                  登出
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar backdrop overlay - visible when sidebar is expanded */}
        {!isNavCollapsed && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:bg-transparent"
            onClick={() => setIsNavCollapsed(true)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          id="main-navigation"
          className={`
            fixed left-0 top-[calc(3.5rem+env(safe-area-inset-top))] bottom-0 z-50
            transition-transform duration-200 ease-out
            ${isNavCollapsed 
              ? "-translate-x-full lg:translate-x-0 lg:w-16" 
              : "translate-x-0 w-56 bg-surface border-r border-border"
            }
          `}
        >
          <Nav isCollapsed={isNavCollapsed} onNavSelect={() => setIsNavCollapsed(true)} />
        </aside>

        {/* Spacer for sidebar on desktop when collapsed - keeps main content positioned correctly */}
        <div className="hidden lg:block shrink-0 w-16 transition-all duration-300" aria-hidden="true" />

        {/* Main content */}
        <main role="main" className="flex-1 overflow-auto p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">{children}</main>
      </div>
    </div>
  );
}

