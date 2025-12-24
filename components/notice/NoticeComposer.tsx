"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

interface NoticeComposerProps {
  onSuccess?: () => void;
}

export function NoticeComposer({ onSuccess }: NoticeComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createNotice = useMutation(api.notices.create);
  const userEmail = useUserEmail();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Notice content cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createNotice({ content: trimmed, userEmail });
      setContent("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notice");
    } finally {
      setIsSubmitting(false);
    }
  }, [content, createNotice, userEmail, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError(null);
        }}
        placeholder="輸入告示..."
        rows={3}
        className="w-full px-3 py-2 text-sm
                   bg-surface-elevated border border-border rounded-lg
                   text-foreground placeholder:text-text-muted
                   focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                   transition-colors duration-200 resize-y min-h-[80px]"
        aria-label="Notice content"
        disabled={isSubmitting}
      />
      
      {error && (
        <p className="text-sm text-error animate-fade-in">{error}</p>
      )}
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          isLoading={isSubmitting}
          disabled={!content.trim()}
        >
          發佈
        </Button>
      </div>
    </form>
  );
}

