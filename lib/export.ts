import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  type TaskDTO,
} from "@/lib/tasks";

function csvCell(value: string): string {
  const sanitized = value.replace(/"/g, '""');
  const dangerous = /^[=+\-@]/.test(sanitized);
  return `"${dangerous ? "'" : ""}${sanitized}"`;
}

export function tasksToCsv(tasks: TaskDTO[]): string {
  const header = [
    "Judul",
    "Kategori",
    "Status",
    "Prioritas",
    "Tenggat",
    "Selesai",
    "Subtask selesai",
    "Total subtask",
    "Estimasi (menit)",
  ];

  const rows = tasks.map((task) => {
    const subtaskDone = task.subtasks.filter((subtask) => subtask.done).length;
    const estimated = task.subtasks.reduce(
      (sum, subtask) => sum + (subtask.estimatedMinutes ?? 0),
      0
    );
    return [
      task.title,
      task.category ?? "",
      STATUS_LABEL[task.status],
      PRIORITY_LABEL[task.priority],
      task.dueDate ? task.dueDate.slice(0, 10) : "",
      task.status === "DONE" ? "Ya" : "Tidak",
      String(subtaskDone),
      String(task.subtasks.length),
      estimated > 0 ? String(estimated) : "",
    ]
      .map(csvCell)
      .join(",");
  });

  return [header.join(","), ...rows].join("\r\n");
}

export function tasksToJson(tasks: TaskDTO[]): string {
  return JSON.stringify(tasks, null, 2);
}

export function downloadBlob(
  content: string,
  filename: string,
  type: string
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
