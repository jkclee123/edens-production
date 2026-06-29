"use client";

import { TodoBoard } from "@/components/todo";
import { DailyVerseDivider } from "@/components/ui";

export default function TodoPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">
        待辦事項
      </h1>

      <DailyVerseDivider />

      <TodoBoard />
    </div>
  );
}
