"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Priority } from "@prisma/client";

import type { PrioritySlice } from "@/lib/dashboard";

const PRIORITY_COLOR: Record<Priority, string> = {
  LOW: "var(--chart-4)",
  MEDIUM: "var(--chart-1)",
  HIGH: "var(--chart-5)",
};

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

export function PriorityChart({ data }: { data: PrioritySlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <div>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.priority} fill={PRIORITY_COLOR[slice.priority]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.map((slice) => (
          <li key={slice.priority} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ background: PRIORITY_COLOR[slice.priority] }}
            />
            <span className="flex-1 text-muted-foreground">{slice.label}</span>
            <span className="font-mono text-xs tabular-nums">
              {slice.count}
              {total > 0 ? ` · ${Math.round((slice.count / total) * 100)}%` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
