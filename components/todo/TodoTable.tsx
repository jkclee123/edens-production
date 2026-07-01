"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  const users = useQuery(api.users.list, {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-3xl table-fixed text-sm lg:text-base">
        <colgroup>
          <col className="w-4 lg:w-6" />
          <col className="w-[12%] lg:w-[30%]" />
          <col className="w-[12%] lg:w-[30%]" />
          <col className="w-14 lg:w-16" />
          <col className="w-[14%]" />
          <col className="w-[16%]" />
          <col className="w-18" />
        </colgroup>
        {level === 0 && (
          <thead className="border-b border-border bg-surface">
            <tr className="text-left text-sm lg:text-base font-bold tracking-wider text-text-muted">
              <th className="px-0 py-2"></th>
              <th className="px-1.5 py-2 whitespace-nowrap">任務名稱</th>
              <th className="px-1.5 py-2 whitespace-nowrap">備註</th>
              <th className="px-1.5 py-2 text-center whitespace-nowrap">狀態</th>
              <th className="px-1.5 py-2 whitespace-nowrap">負責人</th>
              <th className="px-3 py-2">提醒日期</th>
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
              users={users ?? []}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
