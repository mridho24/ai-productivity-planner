import { NextResponse } from "next/server";
import { format, isBefore, startOfDay, subDays } from "date-fns";
import { id } from "date-fns/locale";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AiUnavailableError,
  generateWeeklyInsight,
  type WeeklyStats,
} from "@/lib/ai";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Kamu belum masuk" }, { status: 401 });
  }

  const periodStart = startOfDay(subDays(new Date(), 6));
  const periodEnd = startOfDay(new Date());

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: periodStart },
    },
    include: { subtasks: { select: { done: true } } },
    orderBy: { createdAt: "desc" },
  });

  const tasksCompleted = tasks.filter((task) => task.status === "DONE").length;
  const today = startOfDay(new Date());
  const overdueCount = tasks.filter(
    (task) =>
      task.status !== "DONE" &&
      task.dueDate !== null &&
      isBefore(startOfDay(task.dueDate), today)
  ).length;

  const byPriority: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const task of tasks) {
    byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;
    if (task.category) {
      byCategory[task.category] = (byCategory[task.category] ?? 0) + 1;
    }
  }

  const stats: WeeklyStats = {
    periodStart: format(periodStart, "d MMM yyyy", { locale: id }),
    periodEnd: format(periodEnd, "d MMM yyyy", { locale: id }),
    tasksCreated: tasks.length,
    tasksCompleted,
    completionRate:
      tasks.length === 0 ? 0 : Math.round((tasksCompleted / tasks.length) * 100),
    overdueCount,
    byPriority,
    byCategory,
  };

  try {
    const insight = await generateWeeklyInsight(
      stats,
      tasks.slice(0, 20).map((task) => task.title)
    );
    return NextResponse.json({ stats, insight });
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("AI insight error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyusun insight" },
      { status: 500 }
    );
  }
}
