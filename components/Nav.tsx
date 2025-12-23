"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/inventory",
    label: "Inventory",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        {/* Top Box */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 3h6v6H9V3z M12 3v6"
        />
        {/* Bottom Left Box */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 11h6v6H4v-6z M7 11v6"
        />
        {/* Bottom Right Box */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 11h6v6h-6v-6z M17 11v6"
        />
      </svg>
    ),
  },
  {
    href: "/notice",
    label: "Notice Board",
    icon: (
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
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    href: "/todo",
    label: "Todo List",
    icon: (
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
          d="M5 5l2 2 4-4m-6 9l2 2 4-4m-6 9l2 2 4-4M13 6h8M13 13h8M13 20h8"
        />
      </svg>
    ),
  },
];

interface NavProps {
  isCollapsed: boolean;
  onNavSelect?: () => void;
}

export function Nav({ isCollapsed, onNavSelect }: NavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 p-2 pb-safe">
      <ul role="list" className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavSelect}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5
                  transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface
                  ${
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-text-muted hover:bg-surface-elevated hover:text-foreground"
                  }
                `}
                title={isCollapsed ? item.label : undefined}
                aria-label={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

