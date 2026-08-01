import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getDashboardStats, getUpcomingTasks } from "@/lib/dashboard";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [stats, upcoming] = await Promise.all([
    getDashboardStats(session.user.id),
    getUpcomingTasks(session.user.id),
  ]);

  return (
    <DashboardContent stats={stats} upcoming={upcoming} name={session.user.name} />
  );
}
