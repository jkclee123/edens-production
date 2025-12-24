"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NoticeComposer, NoticeSearch, NoticeCard } from "@/components/notice";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

export default function NoticePage() {
  const [search, setSearch] = useState("");
  const userEmail = useUserEmail();

  const notices = useQuery(api.notices.list, {
    search: search || undefined,
    userEmail,
  });

  const isLoading = notices === undefined;
  const hasError = notices === null;
  const isEmpty = notices && notices.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">
          告示
        </h1>
        <NoticeSearch value={search} onChange={setSearch} />
      </div>
      <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

      {/* Composer */}
      <NoticeComposer />

      {/* Notices list */}
      <div className="space-y-4">
        {isLoading && <Loading message="載入告示..." />}
        
        {hasError && (
          <ErrorState 
            message="Failed to load notices"
            onRetry={() => window.location.reload()}
          />
        )}

        {isEmpty && !search && (
          <div className="card text-center py-8">
            <svg 
              className="w-12 h-12 mx-auto mb-3 text-text-muted"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <p className="text-text-muted">
              No notices yet. Be the first to post!
            </p>
          </div>
        )}

        {isEmpty && search && (
          <div className="card text-center py-8">
            <svg 
              className="w-12 h-12 mx-auto mb-3 text-text-muted"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <p className="text-text-muted">
              無符合搜尋條件的告示
            </p>
            <button 
              onClick={() => setSearch("")}
              className="mt-2 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              清空搜尋
            </button>
          </div>
        )}

        {notices && notices.length > 0 && (
          <div className="space-y-4">
            {notices.map((notice) => (
              <NoticeCard key={notice._id} notice={notice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
