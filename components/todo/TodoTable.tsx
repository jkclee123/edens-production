"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TodoWithMeta } from "@/lib/types/todos";
import { TodoRow } from "./TodoRow";

interface TodoTableProps {
  todos: TodoWithMeta[];
}

export function TodoTable({ todos }: TodoTableProps) {
  const users = useQuery(api.users.list, {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-xl table-fixed text-sm lg:text-base">
        <colgroup>
          <col className="w-[2%]" />
          <col className="w-[12%] lg:w-[26%]" />
          <col className="w-[12%] lg:w-[26%]" />
          <col className="w-[6%] lg:w-[10%]" />
          <col className="w-[7%] lg:w-[10%]" />
          <col className="w-[8%] lg:w-[12%]" />
          <col className="w-[12%] lg:w-[12%]" />
          <col className="w-[3%]" />
        </colgroup>
        <thead className="border-b border-border bg-surface">
          <tr className="text-left text-sm lg:text-base font-bold tracking-wider text-text-muted">
            <th className="px-0 py-2"></th>
            <th className="px-1 py-2 whitespace-nowrap">任務名稱</th>
            <th className="px-1 py-2 whitespace-nowrap">備註</th>
            <th className="px-1.5 py-2 text-center whitespace-nowrap">狀態</th>
            <th className="px-1 py-2 whitespace-nowrap">優先</th>
            <th className="px-1 py-2 whitespace-nowrap">負責人</th>
            <th className="px-1 py-2">提醒日期</th>
            <th className="px-1 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {todos.map((todo) => (
            <TodoRow key={todo._id} todo={todo} users={users ?? []} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
