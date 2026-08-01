"use client";

import { Search, X } from "lucide-react";
import type { Priority, Status } from "@prisma/client";

import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/tasks";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TaskFilterState = {
  status: "ALL" | Status;
  priority: "ALL" | Priority;
  search: string;
};

export function TaskFilters({
  filters,
  onChange,
  count,
  total,
}: {
  filters: TaskFilterState;
  onChange: (filters: TaskFilterState) => void;
  count: number;
  total: number;
}) {
  const hasFilter =
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.search.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          placeholder="Cari tugas atau kategori…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ ...filters, status: value as TaskFilterState["status"] })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua status</SelectItem>
            {STATUS_ORDER.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABEL[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onChange({
              ...filters,
              priority: value as TaskFilterState["priority"],
            })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua prioritas</SelectItem>
            {PRIORITY_ORDER.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {PRIORITY_LABEL[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilter ? (
          <button
            type="button"
            onClick={() => onChange({ status: "ALL", priority: "ALL", search: "" })}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
            Reset
          </button>
        ) : null}
      </div>

      <p className="font-mono text-xs whitespace-nowrap text-muted-foreground">
        {count}/{total} tugas
      </p>
    </div>
  );
}
