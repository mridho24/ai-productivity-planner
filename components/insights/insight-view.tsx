"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Lightbulb,
  ListChecks,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { PRIORITY_LABEL } from "@/lib/tasks";
import type { Priority } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatCell } from "@/components/dashboard/stat-cell";
import type { WeeklyInsight, WeeklyStats } from "@/lib/ai";

type InsightResponse = { stats: WeeklyStats; insight: WeeklyInsight };

type LoadState =
  | { status: "loading" }
  | { status: "success"; data: InsightResponse }
  | { status: "error"; message: string };

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof Sparkles;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="size-4" />
      </span>
      <h2 className="font-heading text-base font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}

export function InsightView() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  function applyResult(result: {
    ok: boolean;
    body: Partial<InsightResponse> & { error?: string };
  }) {
    if (result.ok) {
      setState({ status: "success", data: result.body as InsightResponse });
    } else {
      setState({
        status: "error",
        message: result.body.error ?? "Gagal memuat insight",
      });
    }
  }

  function handleRetry() {
    setState({ status: "loading" });
    fetch("/api/ai/insight")
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        return { ok: response.ok, body };
      })
      .then(applyResult)
      .catch(() => {
        setState({ status: "error", message: "Terjadi kesalahan, coba lagi" });
      });
  }

  useEffect(() => {
    fetch("/api/ai/insight")
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        return { ok: response.ok, body };
      })
      .then(applyResult)
      .catch(() => {
        setState({ status: "error", message: "Terjadi kesalahan, coba lagi" });
      });
  }, []);

  if (state.status === "loading") {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-6 border-y border-border py-8 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse space-y-3">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-10 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
        <section className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2.5">
            <div className="size-8 animate-pulse rounded-lg bg-muted" />
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </section>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <section className="relative overflow-hidden rounded-xl bg-black p-6 text-slate-100 ring-1 ring-white/10 sm:p-8">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#2dd4bf]/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2dd4bf]/15 text-[#2dd4bf]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                AI weekly insight
              </p>
              <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight">
                Insight belum bisa dimuat
              </h2>
              <p className="mt-1 max-w-md text-sm text-slate-300">
                {state.message}
              </p>
            </div>
          </div>
          <Button
            onClick={handleRetry}
            className="bg-[#2dd4bf] font-semibold text-black hover:bg-[#2dd4bf]/85"
          >
            <RefreshCw />
            Coba lagi
          </Button>
        </div>
      </section>
    );
  }

  const { stats, insight } = state.data;

  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-2 gap-6 border-y border-border py-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border">
        <StatCell label="Dibuat pekan ini" value={stats.tasksCreated} className="lg:pr-6" />
        <StatCell label="Selesai" value={stats.tasksCompleted} className="lg:px-6" />
        <StatCell label="Completion" value={`${stats.completionRate}%`} className="lg:px-6" />
        <StatCell
          label="Terlambat"
          value={stats.overdueCount}
          danger={stats.overdueCount > 0}
          className="lg:pl-6"
        />
      </div>

      {insight.summary ? (
        <section className="rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-7">
          <SectionHeader icon={Sparkles} title="Ringkasan pekan ini" />
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">
            {insight.summary}
          </p>
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        {insight.highlights.length > 0 ? (
          <section className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <SectionHeader icon={Trophy} title="Sorotan" />
            <ul className="mt-4 space-y-3">
              {insight.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span className="text-sm text-foreground/80">{highlight}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {insight.suggestions.length > 0 ? (
          <section className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <SectionHeader icon={Lightbulb} title="Saran untuk pekan depan" />
            <ul className="mt-4 space-y-3">
              {insight.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <TrendingUp className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span className="text-sm text-foreground/80">{suggestion}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {(Object.keys(stats.byPriority).length > 0 ||
        Object.keys(stats.byCategory).length > 0) && (
        <section className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <SectionHeader icon={ListChecks} title="Sebaran tugas" />
          <div className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
            {Object.keys(stats.byPriority).length > 0 ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Prioritas
                </p>
                <ul className="mt-2 space-y-1.5">
                  {Object.entries(stats.byPriority).map(([key, value]) => (
                    <li
                      key={key}
                      className="flex items-center justify-between gap-6 text-sm"
                    >
                      <span className="text-muted-foreground">
                        {PRIORITY_LABEL[key as Priority] ?? key}
                      </span>
                      <span className="font-mono tabular-nums">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {Object.keys(stats.byCategory).length > 0 ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Kategori
                </p>
                <ul className="mt-2 space-y-1.5">
                  {Object.entries(stats.byCategory).map(([key, value]) => (
                    <li
                      key={key}
                      className="flex items-center justify-between gap-6 text-sm"
                    >
                      <span
                        className={cn("max-w-48 truncate text-muted-foreground")}
                      >
                        {key}
                      </span>
                      <span className="font-mono tabular-nums">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
