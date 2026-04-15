import { Flame, Coins } from "lucide-react";
import { loadState } from "@/lib/gameStorage";

interface GameHeaderProps {
  onRefresh?: () => void;
}

export default function GameHeader({ onRefresh }: GameHeaderProps) {
  const state = loadState();
  const activePet = state.pets.find((p) => p.id === state.activePetId);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-tight text-primary" style={{ fontFamily: "Outfit, sans-serif" }}>
            ToyPetMe
          </span>
        </div>

        <div className="flex items-center gap-3">
          {state.dailyStreak > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5" data-testid="streak-display">
              <Flame size={14} />
              <span className="text-xs font-bold">{state.dailyStreak}</span>
            </div>
          )}

          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5" data-testid="coins-display">
            <Coins size={14} />
            <span className="text-sm font-bold">{state.coins.toLocaleString()}</span>
          </div>

          {activePet && (
            <div className="flex items-center gap-1 bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5" data-testid="level-display">
              <span className="text-xs font-semibold">Lv</span>
              <span className="text-sm font-bold">{activePet.level}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
