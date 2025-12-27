"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loading } from "@/components/Loading";
import { Button, DailyVerseDivider } from "@/components/ui";
import { LocationTable } from "@/components/locations";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import { useToast, getErrorMessage } from "@/components/ui/Toast";

export default function LocationSettingsPage() {
  const locations = useQuery(api.locations.list);
  const createLocation = useMutation(api.locations.create);
  const userEmail = useUserEmail();
  const { error: showError } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLocation = async () => {
    setIsAdding(true);
    try {
      await createLocation({ name: "新位置", userEmail });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  };

  if (locations === undefined) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display tracking-tight">
          位置設定
        </h1>
      </div>

      <DailyVerseDivider />

      <div className="flex flex-col sm:flex-row justify-end">
        <Button
          onClick={handleAddLocation}
          isLoading={isAdding}
          className="w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增位置
        </Button>
      </div>

      <LocationTable locations={locations} />
    </div>
  );
}

