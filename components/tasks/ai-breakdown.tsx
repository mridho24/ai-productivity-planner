"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { TaskDTO } from "@/lib/tasks";
import { Button } from "@/components/ui/button";

export function AiBreakdown({ task }: { task: TaskDTO }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleBreakdown() {
    setPending(true);
    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(body.error ?? "Gagal memecah tugas, coba lagi");
        return;
      }

      const count = Array.isArray(body.subtasks) ? body.subtasks.length : 0;
      toast.success(
        count > 0
          ? `AI menambahkan ${count} sub-task`
          : "Sub-task berhasil ditambahkan"
      );
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-xl bg-black p-6 text-slate-100 ring-1 ring-white/10 sm:p-7">
      <div className="dot-grid absolute inset-0 opacity-40" />
      <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#2dd4bf]/15 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2dd4bf]/15 text-[#2dd4bf]">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              AI breakdown
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight">
              Pecah tugas ini otomatis
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-300">
              AI akan membagi &quot;{task.title}&quot; menjadi sub-task lengkap
              dengan estimasi waktu, lalu menambahkannya ke daftar di bawah.
            </p>
          </div>
        </div>

        <Button
          onClick={handleBreakdown}
          disabled={pending}
          className="bg-[#2dd4bf] font-semibold text-black hover:bg-[#2dd4bf]/85"
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {pending ? "Memecah…" : "Pecah dengan AI"}
        </Button>
      </div>

      {pending ? (
        <div className="relative mt-5 grid gap-2.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-xl bg-white/10"
              style={{ opacity: 1 - index * 0.25 }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
