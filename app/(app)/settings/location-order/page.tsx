"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EditableOrderCell } from "@/components/locationOrder";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import Link from "next/link";

export default function LocationOrderSettingsPage() {
  const userEmail = useUserEmail();
  const locationsWithOrders = useQuery(api.locationOrders.listWithOrders, { userEmail });

  if (locationsWithOrders === undefined) {
    return <Loading message="Loading location order settings..." />;
  }

  if (locationsWithOrders === null) {
    return <ErrorState message="Failed to load location order settings" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-display">
            Location Order Settings
          </h1>
        </div>
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm
                     bg-surface border border-border rounded-lg
                     text-text-muted hover:text-foreground hover:border-accent
                     transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Inventory
        </Link>
      </div>

      {/* Locations table */}
      {locationsWithOrders.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-hover flex items-center justify-center">
              <svg
                className="w-6 h-6 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No locations yet</h3>
            <p className="text-sm text-text-muted">
              Locations will appear here once they&apos;re added to the system.
            </p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider w-32">
                  Order
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {locationsWithOrders.map(({ location, order }) => (
                <tr
                  key={location._id}
                  className="hover:bg-surface-hover transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{location.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <EditableOrderCell locationId={location._id} currentOrder={order} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview section */}
      <div className="card">
        <h3 className="text-sm font-medium text-foreground mb-3">Current Order Preview</h3>
        <div className="flex flex-wrap gap-2">
          {[...locationsWithOrders]
            .sort((a, b) => {
              // Locations with order values come first
              if (a.order !== null && b.order !== null) {
                if (a.order !== b.order) return a.order - b.order;
                return a.location.name.toLowerCase().localeCompare(b.location.name.toLowerCase());
              }
              if (a.order !== null && b.order === null) return -1;
              if (a.order === null && b.order !== null) return 1;
              return a.location.name.toLowerCase().localeCompare(b.location.name.toLowerCase());
            })
            .map(({ location, order }, index) => (
              <div
                key={location._id}
                className={`px-3 py-1.5 text-xs rounded-full border ${
                  order !== null
                    ? "bg-surface-hover border-border text-foreground"
                    : "bg-surface border-border/50 text-text-muted"
                }`}
              >
                {index + 1}. {location.name}
                {order !== null && <span className="ml-1 text-text-muted">({order})</span>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
