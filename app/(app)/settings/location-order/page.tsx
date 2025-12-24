"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { DraggableLocationList } from "@/components/locationOrder";
import { useUserEmail } from "@/lib/hooks/useUserEmail";

export default function LocationOrderSettingsPage() {
  const userEmail = useUserEmail();
  const locationsWithOrders = useQuery(api.locationOrders.listWithOrders, { userEmail });

  if (locationsWithOrders === undefined) {
    return <Loading message="載入位置排序..." />;
  }

  if (locationsWithOrders === null) {
    return <ErrorState message="你個嘢壞左呀！" />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">
          位置排序
        </h1>
      </div>
      <div className="h-px bg-gradient-to-r from-accent via-accent/50 to-transparent" />

      {/* Main content */}
      <DraggableLocationList locations={locationsWithOrders} />
    </div>
  );
}
