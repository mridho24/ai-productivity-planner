"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { CalendarClock, ChartPie, Layers, Sparkles, Target } from "lucide-react";

import type { DashboardStats } from "@/lib/dashboard";
import { dueLabel, isTaskOverdue, type TaskDTO } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { CompletionRing } from "@/components/dashboard/completion-ring";
import { StatCell } from "@/components/dashboard/stat-cell";
import { StatusStack } from "@/components/dashboard/status-stack";
import { MeshGradientSVG } from "@/components/ui/shader-svg";

const PriorityChart = dynamic(
  () =>
    import("@/components/dashboard/priority-chart").then(
      (mod) => mod.PriorityChart
    ),
  {
    ssr: false,
    loading: () => (
      <div>
        <div className="mx-auto size-40 animate-pulse rounded-full bg-muted" />
        <div className="mt-5 space-y-2">
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-3/5 animate-pulse rounded bg-muted" />
        </div>
      </div>
    ),
  }
);

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function SectionEyebrow({
  icon: Icon,
  children,
}: {
  icon: typeof Layers;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="size-3.5 text-brand" />
      {children}
    </p>
  );
}

export function DashboardContent({
  stats,
  upcoming,
  name,
}: {
  stats: DashboardStats;
  upcoming: TaskDTO[];
  name?: string | null;
}) {
  const summary = [
    `${stats.done} dari ${stats.total} tugas selesai`,
    stats.overdue > 0
      ? `${stats.overdue} terlambat`
      : "tidak ada yang terlambat",
    stats.total > 0 ? `completion ${stats.completionRate}%` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="grid gap-12"
    >
      {/* HERO */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="max-w-xl">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand">
            <Sparkles className="size-3.5" />
            Ringkasan pekan ini
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Halo, {name ?? "kamu"}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">{summary}.</p>
        </div>

        <MeshGradientSVG className="w-20 shrink-0 self-center sm:w-28 sm:self-end" />
      </motion.div>

      {/* STAT BAND */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 gap-6 border-y border-border py-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border"
      >
        <StatCell label="Total tugas" value={stats.total} className="lg:pr-6" />
        <StatCell label="Selesai" value={stats.done} className="lg:px-6" />
        <StatCell
          label="Sedang dikerjakan"
          value={stats.inProgress}
          className="lg:px-6"
        />
        <StatCell
          label="Terlambat"
          value={stats.overdue}
          danger={stats.overdue > 0}
          className="lg:pl-6"
        />
      </motion.div>

      {/* CHARTS */}
      <motion.div
        variants={fadeUp}
        className="grid gap-12 lg:grid-cols-2 lg:gap-16"
      >
        <section className="border-t border-border pt-6">
          <SectionEyebrow icon={Layers}>Distribusi status</SectionEyebrow>
          <h2 className="mt-1.5 font-heading text-lg font-semibold tracking-tight">
            Bagaimana progres dibagi
          </h2>
          <div className="mt-7">
            <StatusStack data={stats.byStatus} />
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <SectionEyebrow icon={ChartPie}>Distribusi prioritas</SectionEyebrow>
          <h2 className="mt-1.5 font-heading text-lg font-semibold tracking-tight">
            Apa yang paling mendesak
          </h2>
          <div className="mt-4">
            <PriorityChart data={stats.byPriority} />
          </div>
        </section>
      </motion.div>

      {/* COMPLETION + UPCOMING */}
      <motion.div
        variants={fadeUp}
        className="grid gap-12 lg:grid-cols-5 lg:gap-16"
      >
        <section className="border-t border-border pt-6 lg:col-span-2">
          <SectionEyebrow icon={Target}>Completion rate</SectionEyebrow>
          <h2 className="mt-1.5 font-heading text-lg font-semibold tracking-tight">
            Seberapa jauh kamu
          </h2>
          <div className="mt-4">
            <CompletionRing rate={stats.completionRate} />
          </div>
        </section>

        <section className="border-t border-border pt-6 lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SectionEyebrow icon={CalendarClock}>Tenggat terdekat</SectionEyebrow>
              <h2 className="mt-1.5 font-heading text-lg font-semibold tracking-tight">
                Akan datang
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
            <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Tidak ada tenggat yang mendekat. Kamu aman untuk sekarang.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {upcoming.map((task) => {
                const overdue = isTaskOverdue(task);
                return (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 py-3"
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
                        overdue
                          ? "font-medium text-destructive"
                          : "text-muted-foreground"
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
