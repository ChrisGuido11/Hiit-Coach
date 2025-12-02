import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ExerciseMasterySummary, ExerciseMasteryTier } from "@shared/schema";

export const MASTERY_TIERS: Array<{
  tier: ExerciseMasteryTier;
  range: string;
  description: string;
  color: string;
}> = [
  { tier: "Novice", range: "0-39", description: "Learning form and consistency", color: "bg-rose-500/20 text-rose-200" },
  { tier: "Building", range: "40-69", description: "Solid fundamentals, keep refining", color: "bg-amber-500/20 text-amber-200" },
  { tier: "Pro", range: "70-89", description: "Confident execution, ready for progressions", color: "bg-emerald-500/20 text-emerald-200" },
  { tier: "Master", range: "90-100", description: "Dialed in technique; push volume or variants", color: "bg-sky-500/20 text-sky-100" },
];

export function MasteryTierLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {MASTERY_TIERS.map((tier) => (
        <Card key={tier.tier} className="p-3 bg-card/60 border-border/60">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${tier.color} border-transparent`}>{tier.tier}</Badge>
                <span className="text-xs text-muted-foreground">{tier.range}</span>
              </div>
              <p className="text-sm text-white">{tier.description}</p>
            </div>
            {!compact && <span className="text-xs text-muted-foreground">Mastery</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function MasteryProgressList({ items }: { items: ExerciseMasterySummary[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">We will track mastery after your first workout.</p>;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const tier = MASTERY_TIERS.find((t) => t.tier === item.masteryTier) ?? MASTERY_TIERS[0];
        const progressWidth = Math.max(5, Math.min(100, item.masteryScore));
        const lastPerformedLabel = item.lastPerformedAt
          ? new Date(item.lastPerformedAt).toLocaleDateString()
          : "Not logged yet";

        return (
          <div key={item.exerciseName} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-white">
              <span className="font-semibold">{item.exerciseName}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge className={`${tier.color} border-transparent`}>{item.masteryTier}</Badge>
                <span>{item.masteryScore}%</span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
              <div className={`h-full ${tier.color.replace("text", "bg")} rounded-full`} style={{ width: `${progressWidth}%` }} />
            </div>
            <div className="text-[11px] text-muted-foreground flex justify-between">
              <span>Last logged: {lastPerformedLabel}</span>
              <span>{item.sampleSize} sets</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
