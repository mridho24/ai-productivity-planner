import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/tasks";
import { TaskManager } from "@/components/tasks/task-manager";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { subtasks: true },
  });

  return <TaskManager tasks={tasks.map(serializeTask)} />;
}
