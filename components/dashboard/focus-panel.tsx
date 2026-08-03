"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Crosshair, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import type { Priority } from "@prisma/client";

import { updateTaskPriority } from "@/lib/actions/tasks";
import {
  PRIORITY_LABEL,
  dueLabel,
  isTaskOverdue,
  type TaskDTO,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Suggestion = {
  taskId: string;
  suggestedPriority: Priority;
  reasoning: string;
  focusScore: number;
};

export function FocusPanel({ tasks }: { tasks: TaskDTO[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = suggestions.filter(
    (suggestion) =>
      !dismissed.has(suggestion.taskId) && !applied.has(suggestion.taskId)
  );

  async function handleAnalyze() {
    setLoading(true);
    setSuggestions([]);
    setApplied(new Set());
    setDismissed(new Set());
    try {
      const payload = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate,
        overdue: isTaskOverdue(task),
      }));
      const response = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: payload }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error ?? "Gagal menganalisis prioritas");
        return;
      }
      if (!Array.isArray(body.suggestions) || body.suggestions.length === 0) {
        toast.info("AI tidak menghasilkan saran, coba lagi");
        return;
      }
      setSuggestions(body.suggestions as Suggestion[]);
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  function handleApply(suggestion: Suggestion) {
    setPendingId(suggestion.taskId);
    startTransition(async () => {
      const result = await updateTaskPriority(
        suggestion.taskId,
        suggestion.suggestedPriority
      );
      setPendingId(null);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Prioritas diperbarui");
      setApplied((prev) => new Set(prev).add(suggestion.taskId));
      router.refresh();
    });
  }

  function handleApplyAll() {
    startTransition(async () => {
      for (const suggestion of visible) {
        const result = await updateTaskPriority(
          suggestion.taskId,
          suggestion.suggestedPriority
        );
        if (!result?.error) {
          setApplied((prev) => new Set(prev).add(suggestion.taskId));
        }
      }
      toast.success("Semua prioritas diperbarui");
      router.refresh();
    });
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]));

  return (
    <section className="border-t border-border pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Crosshair className="size-3.5 text-brand" />
            AI smart prioritization
          </p>
          <h2 className="mt-1.5 font-heading text-lg font-semibold tracking-tight">
            Fokus hari ini
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Biarkan AI menilai {tasks.length} tugas aktif dan menyorot mana yang
            paling mendesak.
          </p>
        </div>

        {suggestions.length === 0 && !loading ? (
          <Button
            onClick={handleAnalyze}
            disabled={tasks.length === 0 || pending}
            className="bg-[#0d9488] text-white hover:bg-[#0f766e]"
          >
            <Sparkles className="size-4" />
            Analisa prioritas
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-5 grid gap-2.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="space-y-2">
                <div className="h-3.5 w-56 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
              </div>
              <div className="size-10 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      ) : null}

      {visible.length > 0 ? (
        <div className="mt-5 grid gap-2.5">
          {visible.slice(0, 5).map((suggestion) => {
            const task = taskById.get(suggestion.taskId);
            if (!task) return null;
            const changed = task.priority !== suggestion.suggestedPriority;
            return (
              <div
                key={suggestion.taskId}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 sm:flex-nowrap"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold tabular-nums",
                    suggestion.focusScore >= 70
                      ? "bg-brand/15 text-brand"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {suggestion.focusScore}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {suggestion.reasoning}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    {changed ? (
                      <>
                        <span>{PRIORITY_LABEL[task.priority]}</span>
                        <span>→</span>
                      </>
                    ) : null}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5",
                        suggestion.suggestedPriority === "HIGH" &&
                          "bg-destructive/10 text-destructive",
                        suggestion.suggestedPriority === "MEDIUM" &&
                          "bg-amber-500/10 text-amber-600",
                        suggestion.suggestedPriority === "LOW" &&
                          "bg-muted text-muted-foreground"
                      )}
                    >
                      {PRIORITY_LABEL[suggestion.suggestedPriority]}
                    </span>
                    {task.dueDate ? (
                      <span className={cn(isTaskOverdue(task) && "text-destructive")}>
                        · {dueLabel(task)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDismissed((prev) => new Set(prev).add(suggestion.taskId))
                    }
                    disabled={pending}
                    aria-label="Lewati saran ini"
                  >
                    <X />
                    Lewati
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApply(suggestion)}
                    disabled={pending}
                  >
                    {pendingId === suggestion.taskId ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Check />
                    )}
                    Terapkan
                  </Button>
                </div>
              </div>
            );
          })}

          {suggestions.length > 1 ? (
            <Button
              variant="ghost"
              onClick={handleApplyAll}
              disabled={pending || visible.length === 0}
              className="justify-self-start text-brand hover:text-brand/80 hover:bg-transparent"
            >
              Terapkan semua ke {visible.length} tugas
            </Button>
          ) : null}
        </div>
      ) : null}

      {!loading &&
      suggestions.length === 0 &&
      tasks.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Belum ada tugas aktif untuk dianalisis. Tambahkan tugas dulu.
        </p>
      ) : null}
    </section>
  );
}
