"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Priority, Status } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = { success?: boolean; error?: string };

const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi")
    .max(120, "Maksimal 120 karakter"),
  description: z
    .string()
    .trim()
    .max(2000, "Maksimal 2000 karakter")
    .optional()
    .nullable(),
  category: z
    .string()
    .trim()
    .max(60, "Maksimal 60 karakter")
    .optional()
    .nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  dueDate: z.string().nullable().optional(),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

const subtaskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul subtask wajib diisi")
    .max(160, "Maksimal 160 karakter"),
  estimatedMinutes: z.coerce
    .number()
    .int()
    .min(1, "Estimasi minimal 1 menit")
    .max(1440, "Maksimal 1440 menit")
    .optional()
    .nullable(),
});

const createTaskInputSchema = taskInputSchema.extend({
  subtasks: z
    .array(subtaskInputSchema)
    .max(8, "Maksimal 8 sub-task")
    .optional(),
});

export type SubtaskInput = z.infer<typeof subtaskInputSchema>;

async function requireUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

function revalidateTaskPaths(taskId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  if (taskId) revalidatePath(`/tasks/${taskId}`);
}

export async function createTask(
  input: TaskInput & { subtasks?: SubtaskInput[] }
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const parsed = createTaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const data = parsed.data;
  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        category: data.category || null,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        completedAt: data.status === "DONE" ? new Date() : null,
      },
    });

    if (data.subtasks && data.subtasks.length > 0) {
      await tx.subtask.createMany({
        data: data.subtasks.map((subtask, index) => ({
          taskId: created.id,
          title: subtask.title,
          estimatedMinutes: subtask.estimatedMinutes ?? null,
          position: index,
        })),
      });
    }

    return created;
  });

  revalidateTaskPaths(task.id);
  return { success: true };
}

export async function updateTask(
  id: string,
  input: TaskInput
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const parsed = taskInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return { error: "Tugas tidak ditemukan" };

  const data = parsed.data;
  const isDone = data.status === "DONE";
  const completedAt = isDone ? (existing.completedAt ?? new Date()) : null;

  await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      completedAt,
    },
  });

  revalidateTaskPaths(id);
  return { success: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  await prisma.task.deleteMany({ where: { id, userId } });

  revalidateTaskPaths();
  return { success: true };
}

export async function updateTaskStatus(
  id: string,
  status: Status
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : null,
    },
  });

  if (result.count === 0) return { error: "Tugas tidak ditemukan" };

  revalidateTaskPaths(id);
  return { success: true };
}

export async function updateTaskPriority(
  id: string,
  priority: Priority
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: { priority },
  });

  if (result.count === 0) return { error: "Tugas tidak ditemukan" };

  revalidateTaskPaths(id);
  return { success: true };
}

export async function addSubtask(
  taskId: string,
  input: {
    title: string;
    estimatedMinutes?: number | null;
  }
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const parsed = subtaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const owner = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  });
  if (!owner) return { error: "Tugas tidak ditemukan" };

  const count = await prisma.subtask.count({ where: { taskId } });

  await prisma.subtask.create({
    data: {
      taskId,
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes ?? null,
      position: count,
    },
  });

  revalidateTaskPaths(taskId);
  return { success: true };
}

export async function moveSubtask(
  taskId: string,
  subtaskId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const owner = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  });
  if (!owner) return { error: "Tugas tidak ditemukan" };

  const subtasks = await prisma.subtask.findMany({
    where: { taskId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  const from = subtasks.findIndex((subtask) => subtask.id === subtaskId);
  if (from === -1) return { error: "Subtask tidak ditemukan" };

  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= subtasks.length) {
    return { error: direction === "up" ? "Sudah di posisi paling atas" : "Sudah di posisi paling bawah" };
  }

  const reordered = [...subtasks];
  [reordered[from], reordered[to]] = [reordered[to], reordered[from]];

  await prisma.$transaction(
    reordered.map((subtask, index) =>
      prisma.subtask.update({
        where: { id: subtask.id },
        data: { position: index },
      })
    )
  );

  revalidateTaskPaths(taskId);
  return { success: true };
}

export async function updateSubtask(
  subtaskId: string,
  input: {
    title: string;
    estimatedMinutes?: number | null;
  }
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const parsed = subtaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, task: { userId } },
    select: { id: true, taskId: true },
  });
  if (!subtask) return { error: "Subtask tidak ditemukan" };

  await prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes ?? null,
    },
  });

  revalidateTaskPaths(subtask.taskId);
  return { success: true };
}

export async function toggleSubtaskDone(
  subtaskId: string
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, task: { userId } },
    select: { id: true, done: true, taskId: true },
  });
  if (!subtask) return { error: "Subtask tidak ditemukan" };

  await prisma.subtask.update({
    where: { id: subtaskId },
    data: { done: !subtask.done },
  });

  revalidateTaskPaths(subtask.taskId);
  return { success: true };
}

export async function deleteSubtask(
  subtaskId: string
): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "Kamu belum masuk" };

  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, task: { userId } },
    select: { id: true, taskId: true },
  });
  if (!subtask) return { error: "Subtask tidak ditemukan" };

  await prisma.subtask.delete({ where: { id: subtaskId } });

  revalidateTaskPaths(subtask.taskId);
  return { success: true };
}
