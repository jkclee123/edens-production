"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, Button, Input, Select } from "@/components/ui";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import {
  TodoStatus,
  TodoStatusLabels,
  inputValueToReminderDate,
  TodoWithMeta,
} from "@/lib/types/todos";

interface TodoCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
  todos: TodoWithMeta[];
}

export function TodoCreateModal({
  isOpen,
  onClose,
  parentId,
  todos,
}: TodoCreateModalProps) {
  const createTodo = useMutation(api.todos.create);
  const userEmail = useUserEmail();

  const [formData, setFormData] = useState({
    name: "",
    status: TodoStatus.NOT_STARTED,
    remarks: "",
    reminderDate: "",
    parentId: parentId || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        status: TodoStatus.NOT_STARTED,
        remarks: "",
        reminderDate: "",
        parentId: parentId || "",
      });
      setError(null);
    }
  }, [isOpen, parentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError("任務名稱不能為空");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTodo({
        name: trimmedName,
        status: formData.status,
        remarks: formData.remarks.trim() || undefined,
        reminderDate: inputValueToReminderDate(formData.reminderDate),
        parentId: formData.parentId || undefined,
        userEmail,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立任務失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parentOptions = todos
    .filter((todo) => todo.status !== TodoStatus.DONE)
    .map((todo) => ({
      value: todo._id,
      label: todo.name,
    }));

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={parentId ? "新增子任務" : "新增任務"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="任務名稱 *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="輸入任務名稱"
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="狀態"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as TodoStatus })
            }
            options={Object.values(TodoStatus).map((status) => ({
              value: status,
              label: TodoStatusLabels[status],
            }))}
            disabled={isSubmitting}
          />
          <Input
            label="提醒日期"
            type="date"
            value={formData.reminderDate}
            onChange={(e) =>
              setFormData({ ...formData, reminderDate: e.target.value })
            }
            disabled={isSubmitting}
            className="[color-scheme:dark]"
          />
        </div>

        <Input
          label="備註"
          value={formData.remarks}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
          placeholder="例如：50% 完成、等待審核..."
          disabled={isSubmitting}
        />

        {!parentId && parentOptions.length > 0 && (
          <Select
            label="上層任務（選填）"
            value={formData.parentId}
            onChange={(e) =>
              setFormData({ ...formData, parentId: e.target.value })
            }
            options={[
              { value: "", label: "無（頂層任務）" },
              ...parentOptions,
            ]}
            disabled={isSubmitting}
          />
        )}

        {error && <p className="text-sm text-error animate-fade-in">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={!formData.name.trim() || isSubmitting}
            isLoading={isSubmitting}
          >
            建立任務
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
