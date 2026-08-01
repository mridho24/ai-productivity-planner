"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Status } from "@prisma/client";

import type { StatusSlice } from "@/lib/dashboard";

const STATUS_COLOR: Record<Status, string> = {
  TODO: "var(--chart-4)",
  IN_PROGRESS: "var(--chart-1)",
  DONE: "var(--chart-2)",
};

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

export function StatusChart({ data }: { data: StatusSlice[] }) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: -32, bottom: 0 }} barSize={28}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="count" name="Tugas" radius={[6, 6, 0, 0]}>
            {data.map((slice) => (
              <Cell key={slice.status} fill={STATUS_COLOR[slice.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
