import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/tasks";
import { TaskDetail } from "@/components/tasks/task-detail";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
    include: { subtasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!task) {
    notFound();
  }

  return <TaskDetail task={serializeTask(task)} />;
}
