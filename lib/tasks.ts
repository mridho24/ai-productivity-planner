import { format, isBefore, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import type { Priority, Status, Subtask, Task } from "@prisma/client";

export type SubtaskDTO = {
  id: string;
  title: string;
  estimatedMinutes: number | null;
  done: boolean;
};

export type TaskDTO = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  category: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  subtasks: SubtaskDTO[];
};

export const STATUS_LABEL: Record<Status, string> = {
  TODO: "Belum dikerjakan",
  IN_PROGRESS: "Sedang dikerjakan",
  DONE: "Selesai",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
};

export const STATUS_ORDER: Status[] = ["TODO", "IN_PROGRESS", "DONE"];
export const PRIORITY_ORDER: Priority[] = ["LOW", "MEDIUM", "HIGH"];

export function serializeTask(task: Task & { subtasks?: Subtask[] }): TaskDTO {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    subtasks: (task.subtasks ?? []).map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      estimatedMinutes: subtask.estimatedMinutes,
      done: subtask.done,
    })),
  };
}

export function isTaskOverdue(
  task: Pick<TaskDTO, "dueDate" | "status">
): boolean {
  if (!task.dueDate || task.status === "DONE") return false;
  const due = startOfDay(new Date(task.dueDate));
  const today = startOfDay(new Date());
  return isBefore(due, today);
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}j`;
  return `${hours}j ${rest}m`;
}

export function dueInDays(
  task: Pick<TaskDTO, "dueDate" | "status">
): number | null {
  if (!task.dueDate) return null;
  const due = startOfDay(new Date(task.dueDate));
  const today = startOfDay(new Date());
  return Math.round(
    (due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );
}

export function dueLabel(
  task: Pick<TaskDTO, "dueDate" | "status">
): string | null {
  if (!task.dueDate || task.status === "DONE") return null;
  const days = dueInDays(task);
  if (days === null) return null;
  if (days < 0) return "Terlambat";
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";
  if (days <= 7) return `Sisa ${days} hari`;
  return format(new Date(task.dueDate), "d MMM", { locale: id });
}
