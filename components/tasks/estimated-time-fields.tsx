"use client";

import { Input } from "@/components/ui/input";

export function EstimatedTimeFields({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}: {
  hours: string;
  minutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1">
        <Input
          value={hours}
          onChange={(event) => onHoursChange(event.target.value)}
          placeholder="1"
          aria-label="Estimasi jam"
          type="number"
          min={0}
          max={24}
          inputMode="numeric"
          className="w-14"
        />
        <span className="font-mono text-xs text-muted-foreground">jam</span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          value={minutes}
          onChange={(event) => onMinutesChange(event.target.value)}
          placeholder="30"
          aria-label="Estimasi menit"
          type="number"
          min={0}
          max={59}
          inputMode="numeric"
          className="w-14"
        />
        <span className="font-mono text-xs text-muted-foreground">mnt</span>
      </div>
    </div>
  );
}
