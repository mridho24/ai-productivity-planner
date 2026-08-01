"use client";

import Link from "next/link";
import { motion } from "motion/react";

import type { DashboardStats } from "@/lib/dashboard";
import { dueLabel, isTaskOverdue, type TaskDTO } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { CompletionRing } from "@/components/dashboard/completion-ring";
import { StatusChart } from "@/components/dashboard/status-chart";
import { PriorityChart } from "@/components/dashboard/priority-chart";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function DashboardContent({
  stats,
  upcoming,
  name,
}: {
  stats: DashboardStats;
  upcoming: TaskDTO[];
  name?: string | null;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="grid gap-6"
    >
      <motion.div variants={fadeUp}>
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Ringkasan pekan ini
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Halo, {name ?? "kamu"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gambaran singkat progres dan tenggat tugas kamu.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatCard label="Total tugas" value={stats.total} />
        <StatCard label="Selesai" value={stats.done} hint="dari semua tugas" />
        <StatCard label="Sedang dikerjakan" value={stats.inProgress} />
        <StatCard
          label="Terlambat"
          value={stats.overdue}
          hint={stats.overdue > 0 ? "butuh perhatian" : "aman"}
          danger={stats.overdue > 0}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Completion rate
          </p>
          <div className="mt-4">
            <CompletionRing rate={stats.completionRate} />
          </div>
        </section>

        <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Distribusi status
          </p>
          <div className="mt-4">
            <StatusChart data={stats.byStatus} />
          </div>
        </section>

        <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Distribusi prioritas
          </p>
          <div className="mt-4">
            <PriorityChart data={stats.byPriority} />
          </div>
        </section>
      </motion.div>

      <motion.div variants={fadeUp}>
        <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Akan datang
              </p>
              <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight">
                Tenggat terdekat
              </h2>
            </div>
            <Link
              href="/tasks"
              className="text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
              Tidak ada tenggat yang mendekat. Kamu aman untuk sekarang.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border/60">
              {upcoming.map((task) => {
                const overdue = isTaskOverdue(task);
                return (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          overdue ? "bg-destructive" : "bg-brand"
                        )}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="block truncate text-sm font-medium hover:text-brand"
                        >
                          {task.title}
                        </Link>
                        {task.category ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {task.category}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-xs",
                        overdue ? "font-medium text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {dueLabel(task)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </motion.div>
    </motion.div>
  );
}
