"use client";

import { useState } from "react";
import { TodoWithMeta } from "@/lib/types/todos";
import { TodoRow } from "./TodoRow";

interface TodoTableProps {
  todos: TodoWithMeta[];
  level?: number;
  parentExpanded?: boolean;
  onCreateSubtask?: (parentId: string) => void;
}

export function TodoTable({
  todos,
  level = 0,
  parentExpanded = true,
  onCreateSubtask,
}: TodoTableProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(() => {
    return level === 0 ? new Set(todos.map((t) => t._id)) : new Set();
  });

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  if (!parentExpanded) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-xs lg:text-sm">
        <colgroup>
          <col className="w-8" />
          <col className="w-[24%] lg:w-[26%]" />
          <col className="w-[24%] lg:w-[26%]" />
          <col className="w-[20%] lg:w-[16%]" />
          <col className="hidden lg:table-column lg:w-[16%]" />
          <col className="w-18" />
        </colgroup>
        {level === 0 && (
          <thead className="border-b border-border bg-surface">
            <tr className="text-left text-xs font-bold tracking-wider text-text-muted">
              <th className="px-1 py-2"></th>
              <th className="px-1 py-2 whitespace-nowrap">任務名稱</th>
              <th className="px-1.5 py-2 whitespace-nowrap">備註</th>
              <th className="px-1.5 py-2 whitespace-nowrap">狀態</th>
              <th className="hidden lg:table-cell px-3 py-2">提醒日期</th>
              <th className="px-1.5 py-2"></th>
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border">
          {todos.map((todo) => (
            <TodoRow
              key={todo._id}
              todo={todo}
              isExpanded={expandedTasks.has(todo._id)}
              onToggleExpand={() => toggleExpanded(todo._id)}
              onCreateSubtask={onCreateSubtask}
              level={level}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
