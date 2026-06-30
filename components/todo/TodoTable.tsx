"use client";

import { TodoWithMeta } from "@/lib/types/todos";
import { TodoRow } from "./TodoRow";

interface TodoTableProps {
  todos: TodoWithMeta[];
  level?: number;
  onCreateSubtask?: (parentId: string) => void;
}

export function TodoTable({
  todos,
  level = 0,
  onCreateSubtask,
}: TodoTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-sm lg:text-base">
        <colgroup>
          <col className="w-4 lg:w-6" />
          <col className="w-[28%] lg:w-[30%]" />
          <col className="w-[28%] lg:w-[30%]" />
          <col className="w-14 lg:w-16" />
          <col className="hidden lg:table-column lg:w-[16%]" />
          <col className="w-18" />
        </colgroup>
        {level === 0 && (
          <thead className="border-b border-border bg-surface">
            <tr className="text-left text-sm lg:text-base font-bold tracking-wider text-text-muted">
              <th className="px-0 py-2"></th>
              <th className="px-1.5 py-2 whitespace-nowrap">任務名稱</th>
              <th className="px-1.5 py-2 whitespace-nowrap">備註</th>
              <th className="px-1.5 py-2 text-center whitespace-nowrap">狀態</th>
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
              onCreateSubtask={onCreateSubtask}
              level={level}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
