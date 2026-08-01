"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarClock, ListChecks, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Priority, Status } from "@prisma/client";

import {
  deleteTask,
  updateTaskPriority,
  updateTaskStatus,
} from "@/lib/actions/tasks";
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
  dueLabel,
  isTaskOverdue,
  type TaskDTO,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteTaskAlert } from "@/components/tasks/delete-task-alert";

const PRIORITY_BADGE: Record<Priority, string> = {
  LOW: "border-border text-muted-foreground",
  MEDIUM: "border-transparent bg-brand/15 text-brand",
  HIGH: "border-transparent bg-destructive/15 text-destructive",
};

export function TaskItem({
  task,
  onEdit,
}: {
  task: TaskDTO;
  onEdit: (task: TaskDTO) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const overdue = isTaskOverdue(task);

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

  function handlePriority(priority: Priority) {
    startTransition(async () => {
      const result = await updateTaskPriority(task.id, priority);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Prioritas diubah ke "${PRIORITY_LABEL[priority]}"`);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tugas dihapus");
      router.refresh();
    });
  }

  return (
    <article className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:ring-brand/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "mt-1.5 size-2 shrink-0 rounded-full",
              task.status === "DONE"
                ? "bg-emerald-500"
                : overdue
                  ? "bg-destructive"
                  : "bg-brand"
            )}
          />

          <div className="min-w-0">
            <Link
              href={`/tasks/${task.id}`}
              className="block text-[15px] leading-snug font-medium hover:text-brand"
            >
              {task.title}
            </Link>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              {task.category ? (
                <span className="text-xs text-muted-foreground">
                  {task.category}
                </span>
              ) : null}

              <Badge
                variant="outline"
                className={cn("h-5", PRIORITY_BADGE[task.priority])}
              >
                {PRIORITY_LABEL[task.priority]}
              </Badge>

              {task.dueDate ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-mono text-xs",
                    overdue
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  <CalendarClock className="size-3.5" />
                  {dueLabel(task)}
                </span>
              ) : null}

              {task.subtasks.length > 0 ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  <ListChecks className="size-3.5" />
                  {task.subtasks.filter((subtask) => subtask.done).length}/
                  {task.subtasks.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-muted-foreground"
                disabled={pending}
              >
                {STATUS_LABEL[task.status]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Aksi lainnya">
                <span className="sr-only">Aksi lainnya</span>
                <span className="font-heading text-base leading-none">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Ubah prioritas</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={task.priority}
                    onValueChange={(value) => handlePriority(value as Priority)}
                  >
                    {PRIORITY_ORDER.map((priority) => (
                      <DropdownMenuRadioItem key={priority} value={priority}>
                        {PRIORITY_LABEL[priority]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteTaskAlert
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onConfirm={handleDelete}
          />
        </div>
      </div>
    </article>
  );
}
