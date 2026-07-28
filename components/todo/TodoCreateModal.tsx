"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, Button, Input, Select } from "@/components/ui";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import { TodoStatus, inputValueToReminderDate } from "@/lib/types/todos";

interface TodoCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TodoCreateModal({ isOpen, onClose }: TodoCreateModalProps) {
  const createTodo = useMutation(api.todos.create);
  const userEmail = useUserEmail();
  const users = useQuery(api.users.list, {});

  const [formData, setFormData] = useState({
    name: "",
    remarks: "",
    reminderDate: "",
    assigneeId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        remarks: "",
        reminderDate: "",
        assigneeId: "",
      });
      setError(null);
    }
  }, [isOpen]);

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
        status: TodoStatus.NOT_STARTED,
        remarks: formData.remarks.trim() || undefined,
        reminderDate: inputValueToReminderDate(formData.reminderDate),
        assigneeId: formData.assigneeId || undefined,
        userEmail,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立任務失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="新增任務">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="任務名稱 *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="輸入任務名稱"
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
          className="scheme-dark"
        />

        <Input
          label="備註"
          value={formData.remarks}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
          placeholder="例如：50% 完成、等待審核..."
          disabled={isSubmitting}
        />

        <Select
          label="負責人（選填）"
          value={formData.assigneeId}
          onChange={(e) =>
            setFormData({ ...formData, assigneeId: e.target.value })
          }
          options={[
            { value: "", label: "無" },
            ...(users ?? []).map((user) => ({
              value: user._id,
              label: user.name,
            })),
          ]}
          disabled={isSubmitting}
        />

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
