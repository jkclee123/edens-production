"use client";

import { Doc } from "@/convex/_generated/dataModel";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableGroupHeader,
} from "@/components/ui/Table";
import { EditableNameCell } from "./EditableNameCell";
import { QtyStepper } from "./QtyStepper";
import { LocationSelectCell } from "./LocationSelectCell";
import { DeleteInventoryButton } from "./DeleteInventoryButton";

interface InventoryGroup {
  location: Doc<"locations"> | null;
  items: Doc<"inventory">[];
}

interface InventoryTableProps {
  groups: InventoryGroup[];
  locations: Doc<"locations">[];
  totalCount: number;
}

export function InventoryTable({ groups, locations, totalCount }: InventoryTableProps) {
  // Filter out empty groups for display (except when filtering)
  const nonEmptyGroups = groups.filter((g) => g.items.length > 0);

  if (totalCount === 0) {
    return (
      <div className="card text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <p className="text-foreground font-medium">No inventory items yet</p>
            <p className="text-sm text-text-muted mt-1">
              Click &quot;Add Item&quot; to create your first item
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40%] min-w-[200px]">Name</TableHead>
            <TableHead className="w-[120px]">Qty</TableHead>
            <TableHead className="w-[200px]">Location</TableHead>
            <TableHead className="w-[60px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nonEmptyGroups.map((group) => (
            <InventoryGroupRows
              key={group.location?._id ?? "none"}
              group={group}
              locations={locations}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface InventoryGroupRowsProps {
  group: InventoryGroup;
  locations: Doc<"locations">[];
}

function InventoryGroupRows({ group, locations }: InventoryGroupRowsProps) {
  const groupName = group.location?.name ?? "No location";

  return (
    <>
      <TableGroupHeader colSpan={4}>
        <div className="flex items-center gap-2">
          <span>{groupName}</span>
          <span className="text-text-secondary">({group.items.length})</span>
        </div>
      </TableGroupHeader>
      {group.items.map((item) => (
        <TableRow key={item._id}>
          <TableCell>
            <EditableNameCell id={item._id} name={item.name} />
          </TableCell>
          <TableCell>
            <QtyStepper id={item._id} qty={item.qty} />
          </TableCell>
          <TableCell>
            <LocationSelectCell
              id={item._id}
              locationId={item.locationId}
              locations={locations}
            />
          </TableCell>
          <TableCell className="text-right">
            <DeleteInventoryButton id={item._id} name={item.name} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

