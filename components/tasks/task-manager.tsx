"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";

import type { TaskDTO } from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/tasks/empty-state";
import { TaskFilters, type TaskFilterState } from "@/components/tasks/task-filters";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskItem } from "@/components/tasks/task-item";

const initialFilters: TaskFilterState = {
  status: "ALL",
  priority: "ALL",
  search: "",
};

export function TaskManager({ tasks }: { tasks: TaskDTO[] }) {
  const [filters, setFilters] = useState<TaskFilterState>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDTO | null>(null);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (filters.status !== "ALL" && task.status !== filters.status) {
        return false;
      }
      if (filters.priority !== "ALL" && task.priority !== filters.priority) {
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
  }, [tasks, filters]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(task: TaskDTO) {
    setEditing(task);
    setFormOpen(true);
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
        <Button onClick={openCreate}>
          <Plus />
          Buat tugas
        </Button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        count={filtered.length}
        total={tasks.length}
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
