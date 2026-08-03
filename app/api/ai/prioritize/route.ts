import { NextResponse } from "next/server";
import type { Priority } from "@prisma/client";

import { auth } from "@/auth";
import {
  AiUnavailableError,
  generatePrioritySuggestions,
  type TaskForPrioritization,
} from "@/lib/ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Kamu belum masuk" }, { status: 401 });
  }

  let tasks: TaskForPrioritization[];
  try {
    const body = await request.json();
    const raw = body?.tasks;
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada tugas untuk dianalisis" },
        { status: 400 }
      );
    }
    tasks = raw
      .filter(
        (task): task is TaskForPrioritization =>
          typeof task?.id === "string" &&
          typeof task?.title === "string" &&
          ["LOW", "MEDIUM", "HIGH"].includes(task.priority)
      )
      .map((task) => ({
        id: task.id,
        title: task.title,
        priority: task.priority as Priority,
        category: typeof task.category === "string" ? task.category : null,
        dueDate: typeof task.dueDate === "string" ? task.dueDate : null,
        overdue: Boolean(task.overdue),
      }));
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  if (tasks.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada tugas untuk dianalisis" },
      { status: 400 }
    );
  }

  try {
    const suggestions = await generatePrioritySuggestions(tasks);
    const sorted = [...suggestions].sort((a, b) => b.focusScore - a.focusScore);
    return NextResponse.json({ suggestions: sorted });
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("AI prioritize error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menganalisis prioritas" },
      { status: 500 }
    );
  }
}
