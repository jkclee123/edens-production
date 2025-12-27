"use client";

import { Doc } from "@/convex/_generated/dataModel";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { EditableLocationCell } from "./EditableLocationCell";
import { DeleteLocationButton } from "./DeleteLocationButton";

interface LocationTableProps {
  locations: Doc<"locations">[];
}

export function LocationTable({ locations }: LocationTableProps) {
  if (locations.length === 0) {
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
          <div>
            <p className="text-foreground font-medium">未有位置</p>
            <p className="text-sm text-text-muted">按「新增位置」建立第一個位置</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface hover:bg-transparent">
            <TableHead className="w-[90%]">位置名稱</TableHead>
            <TableHead className="w-[10%]">
              <span className="sr-only">操作</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location._id} className="bg-surface-elevated">
              <TableCell>
                <EditableLocationCell id={location._id} name={location.name} />
              </TableCell>
              <TableCell className="text-right">
                <DeleteLocationButton id={location._id} name={location.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

