"use client";

import { type ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-sm text-left ${className}`}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead
      className={`text-xs text-text-muted bg-surface ${className}`}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = "", onClick }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        border-b border-border
        hover:bg-surface-elevated/50
        transition-colors duration-150
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = "" }: TableHeadProps) {
  return (
    <th scope="col" className={`px-4 py-3 font-semibold ${className}`}>
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableCell({
  children,
  className = "",
  colSpan,
}: TableCellProps) {
  return (
    <td className={`px-4 py-3 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

interface TableGroupHeaderProps {
  children: ReactNode;
  colSpan: number;
  className?: string;
}

export function TableGroupHeader({
  children,
  colSpan,
  className = "",
}: TableGroupHeaderProps) {
  return (
    <tr className={`bg-surface ${className}`}>
      <td
        colSpan={colSpan}
        className="px-4 py-2 text-xs font-semibold tracking-wider text-text-muted"
      >
        {children}
      </td>
    </tr>
  );
}

