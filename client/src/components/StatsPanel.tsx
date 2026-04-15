import type { Pet } from "@/lib/gameStorage";
import { applyDecay } from "@/lib/gameStorage";
import { Utensils, Heart, Zap, Droplets } from "lucide-react";

interface StatsPanelProps {
  pet: Pet;
}

const STATS = [
  { key: "hunger" as const, label: "Hunger", icon: Utensils, color: "#F97316" },
  { key: "happiness" as const, label: "Happy", icon: Heart, color: "#EC4899" },
  { key: "energy" as const, label: "Energy", icon: Zap, color: "#8B5CF6" },
  { key: "cleanliness" as const, label: "Clean", icon: Droplets, color: "#3B82F6" },
];

export default function StatsPanel({ pet }: StatsPanelProps) {
  const decayed = applyDecay(pet);

  return (
    <div className="grid grid-cols-2 gap-2 w-full" data-testid="stats-panel">
      {STATS.map(({ key, label, icon: Icon, color }) => {
        const value = Math.round(decayed[key]);
        const isLow = value < 30;
        const isGood = value > 70;

        return (
          <div key={key} className="bg-card border border-border rounded-xl p-3" data-testid={`stat-${key}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Icon size={13} style={{ color }} />
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: isLow ? "#EF4444" : isGood ? "#22C55E" : "#6B7280" }}
              >
                {value}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${value}%`,
                  background: isLow
                    ? "linear-gradient(90deg, #EF4444, #F97316)"
                    : isGood
                    ? `linear-gradient(90deg, ${color}, ${color}99)`
                    : `linear-gradient(90deg, ${color}99, ${color})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
