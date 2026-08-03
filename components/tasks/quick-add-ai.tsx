"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import {
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { Priority } from "@prisma/client";

import { createTask } from "@/lib/actions/tasks";
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  formatMinutes,
} from "@/lib/tasks";
import type { ParsedTask, ParsedSubtask } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Phase = "input" | "parsing" | "preview";

export function QuickAddAi({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [subtasks, setSubtasks] = useState<ParsedSubtask[]>([]);

  function reset() {
    setPhase("input");
    setText("");
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("MEDIUM");
    setDueDate(undefined);
    setSubtasks([]);
  }

  async function handleParse() {
    if (!text.trim()) {
      toast.error("Tuliskan tugasmu terlebih dahulu");
      return;
    }
    setPhase("parsing");
    try {
      const response = await fetch("/api/ai/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error ?? "Gagal memahami tugas");
        setPhase("input");
        return;
      }
      const task = body.task as ParsedTask;
      setTitle(task.title);
      setDescription(task.description ?? "");
      setCategory(task.category ?? "");
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(`${task.dueDate}T00:00:00`) : undefined);
      setSubtasks(task.subtasks ?? []);
      setPhase("preview");
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
      setPhase("input");
    }
  }

  function handleSave() {
    setSaving(true);
    const input = {
      title,
      description: description || null,
      category: category || null,
      priority,
      status: "TODO" as const,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      subtasks: subtasks
        .filter((subtask) => subtask.title.trim().length > 0)
        .map((subtask) => ({
          title: subtask.title.trim(),
          estimatedMinutes: subtask.estimatedMinutes ?? null,
        })),
    };

    createTask(input)
      .then((result) => {
        if (result?.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Tugas dibuat dari AI");
        onOpenChange(false);
        reset();
        router.refresh();
      })
      .catch(() => {
        toast.error("Terjadi kesalahan saat menyimpan");
      })
      .finally(() => setSaving(false));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand" />
            Tulis cepat dengan AI
          </DialogTitle>
          <DialogDescription>
            Ketik seperti biasa, AI akan merapikannya menjadi data tugas.
          </DialogDescription>
        </DialogHeader>

        {phase !== "preview" ? (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="quick-text">Deskripsi tugas</Label>
              <Textarea
                id="quick-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder='cth. "besok jam 9 beli bahan masakan di pasar, kategori rumah tangga, penting"'
                rows={4}
                maxLength={1000}
                autoFocus
              />
            </div>

            <Button
              onClick={handleParse}
              disabled={phase === "parsing"}
              className="w-full bg-[#0d9488] text-white hover:bg-[#0f766e]"
            >
              {phase === "parsing" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <WandSparkles className="size-4" />
              )}
              {phase === "parsing" ? "Menerjemahkan…" : "Terjemahkan dengan AI"}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Hasil terjemahan — bisa diedit
              </p>
              <button
                type="button"
                onClick={() => setPhase("input")}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand outline-none hover:underline"
              >
                <RefreshCw className="size-3" />
                Tulis ulang
              </button>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="preview-title">Judul</Label>
              <Input
                id="preview-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="preview-desc">Deskripsi</Label>
              <Textarea
                id="preview-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                maxLength={2000}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="preview-category">Kategori</Label>
                <Input
                  id="preview-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  maxLength={60}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Prioritas</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as Priority)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_ORDER.map((item) => (
                      <SelectItem key={item} value={item}>
                        {PRIORITY_LABEL[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Tenggat</Label>
              <DatePicker
                value={dueDate}
                onChange={(date) => setDueDate(date ?? undefined)}
                placeholder="Tidak ada tenggat"
              />
            </div>

            {subtasks.length > 0 ? (
              <div className="grid gap-1.5">
                <Label>Sub-task</Label>
                <ul className="grid gap-2">
                  {subtasks.map((subtask, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        {index + 1}.
                      </span>
                      <Input
                        value={subtask.title}
                        onChange={(event) => {
                          const next = [...subtasks];
                          next[index] = {
                            ...next[index],
                            title: event.target.value,
                          };
                          setSubtasks(next);
                        }}
                        className="h-8 border-0 bg-transparent px-1 shadow-none"
                        maxLength={160}
                        aria-label={`Sub-task ${index + 1}`}
                      />
                      {subtask.estimatedMinutes ? (
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          ± {formatMinutes(subtask.estimatedMinutes)}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          setSubtasks((prev) =>
                            prev.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        aria-label={`Hapus sub-task ${index + 1}`}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !title.trim()}
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                Simpan tugas
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
