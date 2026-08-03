import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AiUnavailableError,
  generateSubtaskBreakdown,
} from "@/lib/ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Kamu belum masuk" }, { status: 401 });
  }

  let taskId: string;
  try {
    const body = await request.json();
    taskId = String(body?.taskId ?? "");
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  if (!taskId) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id },
    include: {
      subtasks: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!task) {
    return NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });
  }

  try {
    const aiSubtasks = await generateSubtaskBreakdown({
      title: task.title,
      description: task.description,
      category: task.category,
      existing: task.subtasks.map((subtask) => subtask.title),
    });

    if (aiSubtasks.length === 0) {
      return NextResponse.json(
        { error: "AI tidak menghasilkan sub-task, coba lagi" },
        { status: 502 }
      );
    }

    const startPosition = task.subtasks.length;
    const created = await prisma.$transaction(
      aiSubtasks.map((subtask, index) =>
        prisma.subtask.create({
          data: {
            taskId,
            title: subtask.title,
            estimatedMinutes: subtask.estimatedMinutes,
            position: startPosition + index,
          },
          select: { id: true, title: true, estimatedMinutes: true, done: true },
        })
      )
    );

    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);

    return NextResponse.json({ subtasks: created });
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("AI breakdown error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memecah tugas" },
      { status: 500 }
    );
  }
}
