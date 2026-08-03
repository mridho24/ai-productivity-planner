import { prisma } from "@/lib/prisma";
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
  serializeTask,
  type TaskDTO,
} from "@/lib/tasks";

export type StatusSlice = {
  status: (typeof STATUS_ORDER)[number];
  label: string;
  count: number;
};

export type PrioritySlice = {
  priority: (typeof PRIORITY_ORDER)[number];
  label: string;
  count: number;
};

export type DashboardStats = {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  completionRate: number;
  overdue: number;
  byStatus: StatusSlice[];
  byPriority: PrioritySlice[];
};

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const tasks = await prisma.task.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      priority: true,
      dueDate: true,
      completedAt: true,
    },
  });

  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;
  const todo = tasks.filter((task) => task.status === "TODO").length;
  const completionRate =
    total === 0 ? 0 : Math.round((done / total) * 100);

  const now = Date.now();
  const overdue = tasks.filter(
    (task) =>
      task.status !== "DONE" &&
      task.dueDate &&
      new Date(task.dueDate).getTime() < now
  ).length;

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABEL[status],
    count: tasks.filter((task) => task.status === status).length,
  }));

  const byPriority = PRIORITY_ORDER.map((priority) => ({
    priority,
    label: PRIORITY_LABEL[priority],
    count: tasks.filter((task) => task.priority === priority).length,
  }));

  return {
    total,
    done,
    inProgress,
    todo,
    completionRate,
    overdue,
    byStatus,
    byPriority,
  };
}

export async function getUpcomingTasks(
  userId: string,
  limit = 6
): Promise<TaskDTO[]> {
  const tasks = await prisma.task.findMany({
    where: { userId, status: { not: "DONE" }, dueDate: { not: null } },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: {
      subtasks: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
    },
  });

  return tasks.map(serializeTask);
}

export async function getActiveTasks(
  userId: string,
  limit = 40
): Promise<TaskDTO[]> {
  const tasks = await prisma.task.findMany({
    where: { userId, status: { not: "DONE" } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      subtasks: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
    },
  });

  return tasks.map(serializeTask);
}
