import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  getActiveTasks,
  getDashboardStats,
  getUpcomingTasks,
} from "@/lib/dashboard";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [stats, upcoming, activeTasks] = await Promise.all([
    getDashboardStats(session.user.id),
    getUpcomingTasks(session.user.id),
    getActiveTasks(session.user.id),
  ]);

  return (
    <DashboardContent
      stats={stats}
      upcoming={upcoming}
      activeTasks={activeTasks}
      name={session.user.name}
    />
  );
}
