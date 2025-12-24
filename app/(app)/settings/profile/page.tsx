"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loading } from "@/components/Loading";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

export default function ProfilePage() {
  const { status } = useSession();
  const userEmail = useUserEmail();
  const user = useQuery(api.users.getCurrent, { userEmail });
  const updateName = useMutation(api.users.updateName);
  
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state with database value
  useEffect(() => {
    if (user?.name) {
      setNameValue(user.name);
    }
  }, [user?.name]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    if (user?.name) {
      setNameValue(user.name);
    }
    setIsEditing(true);
    setError(null);
  }, [user?.name]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    if (user?.name) {
      setNameValue(user.name);
    }
    setError(null);
  }, [user?.name]);

  const handleSave = useCallback(async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setError("名稱不能為空");
      return;
    }

    if (trimmed === user?.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateName({ name: trimmed, userEmail });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "無法更新名稱");
    } finally {
      setIsSaving(false);
    }
  }, [nameValue, user?.name, updateName, userEmail]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancelEdit();
    } else if (e.key === "Enter") {
      handleSave();
    }
  }, [handleCancelEdit, handleSave]);

  if (status === "loading" || user === undefined) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-foreground mb-4">Not Signed In</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">帳戶</h1>
      </div>
      <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

      <div className="bg-surface-elevated border border-border rounded-lg p-6">
        <div className="space-y-6">
          {/* Name field with edit/save pattern */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-text-muted">
                名稱
              </label>
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-surface transition-colors"
                  aria-label="編輯名稱"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3" onKeyDown={handleKeyDown}>
                <Input
                  ref={inputRef}
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSaving}
                  placeholder="輸入名稱..."
                  error={error || undefined}
                />

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    取消
                  </Button>
                  <Button
                    type="button"
                    size="md"
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={!nameValue.trim()}
                  >
                    儲存
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-lg text-foreground">{user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              電郵地址
            </label>
            <p className="text-lg text-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
