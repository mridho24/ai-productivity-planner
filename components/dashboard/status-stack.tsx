"use client";

import type { Status } from "@prisma/client";

import type { StatusSlice } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<Status, string> = {
  TODO: "bg-chart-4",
  IN_PROGRESS: "bg-chart-1",
  DONE: "bg-chart-2",
};

export function StatusStack({ data }: { data: StatusSlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <div>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label="Distribusi status tugas"
      >
        {data.map((slice) =>
          slice.count === 0 ? null : (
            <div
              key={slice.status}
              className={STATUS_COLOR[slice.status]}
              style={{
                width: `${(slice.count / Math.max(total, 1)) * 100}%`,
              }}
            />
          )
        )}
      </div>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {data.map((slice) => (
          <li key={slice.status} className="flex items-center gap-2 text-sm">
            <span
              className={cn("size-2.5 rounded-full", STATUS_COLOR[slice.status])}
            />
            <span className="flex-1 text-muted-foreground">{slice.label}</span>
            <span className="font-mono text-xs tabular-nums">{slice.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
