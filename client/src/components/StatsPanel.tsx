import { Card } from "@/components/ui/card";
import StatBar from "./StatBar";
import { Utensils, Heart, Zap, Sparkles } from "lucide-react";

interface StatsPanelProps {
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
}

export default function StatsPanel({ hunger, happiness, energy, cleanliness }: StatsPanelProps) {
  return (
    <Card className="p-6 space-y-4">
      <h3 
        className="text-xl font-semibold mb-4" 
        style={{ fontFamily: 'Outfit, sans-serif' }}
        data-testid="text-stats-title"
      >
        Pet Stats
      </h3>
      <StatBar icon={Utensils} label="Hunger" value={hunger} maxValue={100} color="text-pink-500" />
      <StatBar icon={Heart} label="Happiness" value={happiness} maxValue={100} color="text-yellow-500" />
      <StatBar icon={Zap} label="Energy" value={energy} maxValue={100} color="text-blue-500" />
      <StatBar icon={Sparkles} label="Clean" value={cleanliness} maxValue={100} color="text-green-500" />
    </Card>
  );
}
