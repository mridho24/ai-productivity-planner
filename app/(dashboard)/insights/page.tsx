import { InsightView } from "@/components/insights/insight-view";

export default function InsightsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Insight mingguan
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Insight mingguan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan pola produktivitas dan saran dari AI.
        </p>
      </div>

      <InsightView />
    </div>
  );
}
