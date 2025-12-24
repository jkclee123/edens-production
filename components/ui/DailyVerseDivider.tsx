"use client";

import { useEffect, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DailyVerseDivider() {
  const verse = useQuery(api.dailyVerse.get);
  const refreshVerse = useAction(api.dailyVerse.refreshVerse);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // If no verse found for today, trigger a refresh
  useEffect(() => {
    if (verse === null && !isRefreshing && !hasAttemptedRefresh) {
      setIsRefreshing(true);
      setHasAttemptedRefresh(true);
      refreshVerse({})
        .catch((err) => {
          console.error("Failed to refresh daily verse:", err);
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }
  }, [verse, refreshVerse, isRefreshing, hasAttemptedRefresh]);

  const isLoading = verse === undefined || isRefreshing;

  return (
    <div className="space-y-3">
      {/* Bible verse */}
      {!isLoading && verse && verse.text && (
        <div className="animate-fade-in">
          <blockquote className="text-sm text-text-muted italic leading-relaxed">
            「{verse.text}」 
            <span className="inline-block text-xs text-text-secondary ml-2 mt-1 font-medium">
              - {verse.reference}
            </span>
          </blockquote>
        </div>
      )}
      
      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />
    </div>
  );
}
