"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateSubtask } from "@/lib/actions/tasks";
import type { SubtaskDTO } from "@/lib/tasks";
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
import { EstimatedTimeFields } from "@/components/tasks/estimated-time-fields";

export function SubtaskEditDialog({
  subtask,
  open,
  onOpenChange,
}: {
  subtask: SubtaskDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initialHours = subtask?.estimatedMinutes
    ? String(Math.floor(subtask.estimatedMinutes / 60))
    : "";
  const initialMinutes = subtask?.estimatedMinutes
    ? String(subtask.estimatedMinutes % 60)
    : "";

  const [title, setTitle] = useState(subtask?.title ?? "");
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !subtask) return;

    const hourValue = hours ? Number(hours) : 0;
    const minuteValue = minutes ? Number(minutes) : 0;

    if (hourValue > 24 || minuteValue > 59) {
      toast.error("Jam maksimal 24 dan menit maksimal 59");
      return;
    }

    const totalMinutes = hourValue * 60 + minuteValue;
    if (totalMinutes > 1440) {
      toast.error("Maksimal estimasi 24 jam");
      return;
    }

    startTransition(async () => {
      const result = await updateSubtask(subtask.id, {
        title,
        estimatedMinutes: totalMinutes > 0 ? totalMinutes : null,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Sub-task diperbarui");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit sub-task</DialogTitle>
          <DialogDescription>
            Ubah nama langkah atau perkiraan waktunya.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="subtask-edit-title">Nama</Label>
            <Input
              id="subtask-edit-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nama langkah kecil…"
              maxLength={160}
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Estimasi waktu (opsional)</Label>
            <EstimatedTimeFields
              hours={hours}
              minutes={minutes}
              onHoursChange={setHours}
              onMinutesChange={setMinutes}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
