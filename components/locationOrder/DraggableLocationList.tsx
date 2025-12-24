"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useUserEmail } from "@/lib/hooks/useUserEmail";
import { Button } from "@/components/ui/Button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LocationWithOrder {
  location: Doc<"locations">;
  order: number | null;
}

interface DraggableLocationListProps {
  locations: LocationWithOrder[];
}

interface SortableItemProps {
  item: LocationWithOrder;
  index: number;
}

function SortableItem({ item, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.location._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-4 p-4 rounded-xl
        bg-surface-elevated border border-border
        transition-all duration-200 ease-out
        hover:border-accent/50 hover:bg-surface-elevated/80
        ${isDragging ? "opacity-50 scale-[0.98] z-50 shadow-xl" : ""}
      `}
    >

      {/* Order number badge */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface flex items-center justify-center">
        <span className="text-sm font-bold text-foreground font-mono">
          {index + 1}
        </span>
      </div>

      {/* Location name */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-foreground truncate">
          {item.location.name}
        </h3>
      </div>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 -m-5 p-5 text-text-muted group-hover:text-accent transition-colors cursor-grab active:cursor-grabbing touch-none"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

    </div>
  );
}

export function DraggableLocationList({ locations }: DraggableLocationListProps) {
  const userEmail = useUserEmail();
  const batchUpdateOrder = useMutation(api.locationOrders.batchUpdateOrder);
  
  // Sort locations by their order (or alphabetically if no order)
  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      if (a.order !== null && b.order !== null) {
        if (a.order !== b.order) return a.order - b.order;
        return a.location.name.toLowerCase().localeCompare(b.location.name.toLowerCase());
      }
      if (a.order !== null && b.order === null) return -1;
      if (a.order === null && b.order !== null) return 1;
      return a.location.name.toLowerCase().localeCompare(b.location.name.toLowerCase());
    });
  }, [locations]);

  const [items, setItems] = useState(sortedLocations);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Configure sensors for both mouse/touch with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms hold before drag starts on touch
        tolerance: 5, // 5px movement tolerance during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update items when locations change from server
  useEffect(() => {
    if (!hasChanges) {
      setItems(sortedLocations);
    }
  }, [sortedLocations, hasChanges]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(
          (item) => item.location._id === active.id
        );
        const newIndex = currentItems.findIndex(
          (item) => item.location._id === over.id
        );

        return arrayMove(currentItems, oldIndex, newIndex);
      });
      setHasChanges(true);
    }
  }, []);

  const handleSaveOrder = useCallback(async () => {
    setIsSaving(true);
    try {
      const locationIds = items.map(item => item.location._id);
      await batchUpdateOrder({ locationIds, userEmail });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save order:", error);
    } finally {
      setIsSaving(false);
    }
  }, [items, batchUpdateOrder, userEmail]);

  const handleReset = useCallback(() => {
    setItems(sortedLocations);
    setHasChanges(false);
  }, [sortedLocations]);

  const itemIds = useMemo(
    () => items.map((item) => item.location._id),
    [items]
  );

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-end justify-end">
        <div className="flex gap-3">
          {hasChanges && (
            <Button
              variant="ghost"
              size="md"
              onClick={handleReset}
              disabled={isSaving}
            >
              重置
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveOrder}
            disabled={!hasChanges}
            isLoading={isSaving}
          >
            {isSaving ? "儲存中..." : "儲存"}
          </Button>
        </div>
      </div>

      {/* Draggable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem key={item.location._id} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <svg
              className="w-8 h-8 text-text-muted"
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
          <h3 className="text-lg font-medium text-foreground mb-2">未有位置</h3>
        </div>
      )}
    </div>
  );
}
