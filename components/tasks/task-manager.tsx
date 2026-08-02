"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  PRIORITY_ORDER,
  type TaskDTO,
} from "@/lib/tasks";
import { downloadBlob, tasksToCsv, tasksToJson } from "@/lib/export";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/tasks/empty-state";
import {
  TaskFilters,
  type TaskFilterState,
  type TaskSortOption,
} from "@/components/tasks/task-filters";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskItem } from "@/components/tasks/task-item";

const initialFilters: TaskFilterState = {
  status: "ALL",
  priority: "ALL",
  category: "ALL",
  search: "",
  sort: "newest",
};

function sortTasks(tasks: TaskDTO[], sort: TaskSortOption): TaskDTO[] {
  switch (sort) {
    case "newest":
      return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "oldest":
      return tasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "due":
      return tasks.sort((a, b) => {
        const dueA = a.dueDate ?? "9999-12-31";
        const dueB = b.dueDate ?? "9999-12-31";
        return dueA.localeCompare(dueB);
      });
    case "priority":
      return tasks.sort(
        (a, b) =>
          PRIORITY_ORDER.indexOf(b.priority) -
          PRIORITY_ORDER.indexOf(a.priority)
      );
  }
}

export function TaskManager({ tasks }: { tasks: TaskDTO[] }) {
  const [filters, setFilters] = useState<TaskFilterState>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDTO | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          tasks
            .map((task) => task.category)
            .filter((category): category is string => Boolean(category))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [tasks]
  );

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const matches = tasks.filter((task) => {
      if (filters.status !== "ALL" && task.status !== filters.status) {
        return false;
      }
      if (filters.priority !== "ALL" && task.priority !== filters.priority) {
        return false;
      }
      if (filters.category !== "ALL" && task.category !== filters.category) {
        return false;
      }
      if (
        query &&
        !task.title.toLowerCase().includes(query) &&
        !(task.category ?? "").toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
    return sortTasks(matches, filters.sort);
  }, [tasks, filters]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: TaskDTO) {
    setEditing(task);
    setFormOpen(true);
  }

  function handleExport(format: "csv" | "json") {
    const date = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      downloadBlob(
        tasksToCsv(filtered),
        `planbreak-tasks-${date}.csv`,
        "text/csv;charset=utf-8"
      );
    } else {
      downloadBlob(
        tasksToJson(filtered),
        `planbreak-tasks-${date}.json`,
        "application/json"
      );
    }
    toast.success("Tugas berhasil diekspor");
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            Daftar tugas
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Semua tugas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atur, filter, dan pecah setiap rencana besar jadi langkah kecil.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download />
                Ekspor
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={openCreate}>
            <Plus />
            Buat tugas
          </Button>
        </div>
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        count={filtered.length}
        total={tasks.length}
        categories={categories}
      />

      {filtered.length === 0 ? (
        <EmptyState hasTasks={tasks.length > 0} onAdd={openCreate} />
      ) : (
        <ul className="grid gap-3">
          {filtered.map((task, index) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <TaskItem task={task} onEdit={openEdit} />
            </motion.li>
          ))}
        </ul>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
      />
    </div>
  );
}
