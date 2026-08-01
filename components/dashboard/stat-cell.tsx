import { cn } from "@/lib/utils";

export function StatCell({
  label,
  value,
  danger = false,
  className,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("py-1", className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 font-heading text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl",
          danger && "text-destructive"
        )}
      >
        {value}
      </p>
    </div>
  );
}
