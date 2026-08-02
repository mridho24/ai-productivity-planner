"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, CalendarClock, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import type { Status } from "@prisma/client";

import {
  deleteSubtask,
  deleteTask,
  moveSubtask,
  toggleSubtaskDone,
  updateTaskStatus,
} from "@/lib/actions/tasks";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  dueLabel,
  formatMinutes,
  isTaskOverdue,
  type SubtaskDTO,
  type TaskDTO,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiBreakdownPlaceholder } from "@/components/tasks/ai-breakdown-placeholder";
import { DeleteTaskAlert } from "@/components/tasks/delete-task-alert";
import { SubtaskEditDialog } from "@/components/tasks/subtask-edit-dialog";
import { SubtaskForm } from "@/components/tasks/subtask-form";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";

export function TaskDetail({ task }: { task: TaskDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<SubtaskDTO | null>(null);

  const overdue = isTaskOverdue(task);
  const doneSubtasks = task.subtasks.filter((subtask) => subtask.done).length;
  const progress =
    task.subtasks.length === 0
      ? 0
      : Math.round((doneSubtasks / task.subtasks.length) * 100);

  function handleStatus(status: Status) {
    startTransition(async () => {
      const result = await updateTaskStatus(task.id, status);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Status diubah ke "${STATUS_LABEL[status]}"`);
      router.refresh();
    });
  }

  function handleToggleSubtask(subtaskId: string) {
    startTransition(async () => {
      const result = await toggleSubtaskDone(subtaskId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDeleteSubtask(subtaskId: string) {
    startTransition(async () => {
      const result = await deleteSubtask(subtaskId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Sub-task dihapus");
      router.refresh();
    });
  }

  function handleMoveSubtask(subtaskId: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveSubtask(task.id, subtaskId, direction);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDeleteTask() {
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tugas dihapus");
      router.push("/tasks");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <Link
        href="/tasks"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar
      </Link>

      <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono text-muted-foreground"
                  disabled={pending}
                >
                  {STATUS_LABEL[task.status]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Ubah status</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={task.status}
                  onValueChange={(value) => handleStatus(value as Status)}
                >
                  {STATUS_ORDER.map((status) => (
                    <DropdownMenuRadioItem key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge variant="outline" className="h-5 text-muted-foreground">
              {PRIORITY_LABEL[task.priority]}
            </Badge>

            {overdue ? (
              <Badge
                variant="destructive"
                className="h-5"
              >
                Terlambat
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              Hapus
            </Button>
          </div>
        </div>

        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {task.title}
        </h1>

        {task.category ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Kategori · {task.category}
          </p>
        ) : null}

        {task.description ? (
          <p className="mt-4 text-sm whitespace-pre-wrap text-foreground/80">
            {task.description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              {dueLabel(task)}
            </span>
          ) : null}
          <span>
            Dibuat {format(new Date(task.createdAt), "d MMM yyyy", { locale: id })}
          </span>
        </div>
      </section>

      <section className="rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Sub-task
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight">
              Langkah kecil
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {doneSubtasks}/{task.subtasks.length} selesai
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>

        {task.subtasks.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada sub-task. Tambahkan langkah kecil pertama di bawah.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {task.subtasks.map((subtask, index) => (
              <li key={subtask.id} className="flex items-center gap-2.5 py-2.5">
                <Checkbox
                  checked={subtask.done}
                  onCheckedChange={() => handleToggleSubtask(subtask.id)}
                  aria-label={`Tandai ${subtask.title}`}
                  disabled={pending}
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    subtask.done && "text-muted-foreground line-through"
                  )}
                >
                  {subtask.title}
                </span>
                {subtask.estimatedMinutes ? (
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    ± {formatMinutes(subtask.estimatedMinutes)}
                  </span>
                ) : null}
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveSubtask(subtask.id, "up")}
                    disabled={index === 0 || pending}
                    aria-label={`Pindah ${subtask.title} ke atas`}
                    className="rounded-md p-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSubtask(subtask.id, "down")}
                    disabled={index === task.subtasks.length - 1 || pending}
                    aria-label={`Pindah ${subtask.title} ke bawah`}
                    className="rounded-md p-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSubtask(subtask)}
                    disabled={pending}
                    aria-label={`Edit ${subtask.title}`}
                    className="ml-0.5 rounded-md p-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Hapus ${subtask.title}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <SubtaskForm taskId={task.id} />
        </div>
      </section>

      <AiBreakdownPlaceholder />

      <SubtaskEditDialog
        key={editingSubtask?.id ?? "closed"}
        subtask={editingSubtask}
        open={editingSubtask !== null}
        onOpenChange={(open) => {
          if (!open) setEditingSubtask(null);
        }}
      />

      <TaskFormDialog open={editOpen} onOpenChange={setEditOpen} task={task} />
      <DeleteTaskAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
