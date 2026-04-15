import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Utensils, Dumbbell, Sparkles, BedDouble } from "lucide-react";
import type { Pet, ActionType } from "@/lib/gameStorage";
import { COOLDOWNS, getCooldownRemaining, formatCooldown } from "@/lib/gameStorage";

interface ActionButtonsProps {
  pet: Pet;
  onAction: (action: ActionType) => void;
  disabled?: boolean;
}

const ACTIONS: { id: ActionType; label: string; icon: typeof Utensils; color: string; bg: string }[] = [
  { id: "feed", label: "Feed", icon: Utensils, color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100" },
  { id: "play", label: "Play", icon: Dumbbell, color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100" },
  { id: "clean", label: "Clean", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
  { id: "sleep", label: "Sleep", icon: BedDouble, color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100" },
];

function useCountdown(pet: Pet) {
  const [countdowns, setCountdowns] = useState<Record<ActionType, number>>({
    feed: 0, play: 0, clean: 0, sleep: 0,
  });

  useEffect(() => {
    const update = () => {
      setCountdowns({
        feed: getCooldownRemaining(pet, "feed"),
        play: getCooldownRemaining(pet, "play"),
        clean: getCooldownRemaining(pet, "clean"),
        sleep: getCooldownRemaining(pet, "sleep"),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [pet]);

  return countdowns;
}

export default function ActionButtons({ pet, onAction, disabled }: ActionButtonsProps) {
  const countdowns = useCountdown(pet);
  const [lastPressed, setLastPressed] = useState<ActionType | null>(null);

  const handleAction = useCallback(
    (action: ActionType) => {
      if (countdowns[action] > 0 || disabled) return;
      setLastPressed(action);
      onAction(action);
      if (navigator.vibrate) navigator.vibrate(30);
    },
    [countdowns, disabled, onAction]
  );

  return (
    <div className="grid grid-cols-4 gap-3 w-full" data-testid="action-buttons">
      {ACTIONS.map(({ id, label, icon: Icon, color, bg }) => {
        const cd = countdowns[id];
        const isReady = cd === 0;
        const isActive = lastPressed === id;

        return (
          <button
            key={id}
            onClick={() => handleAction(id)}
            disabled={!isReady || disabled}
            data-testid={`action-${id}`}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-150 cursor-pointer
              ${isReady && !disabled
                ? `${bg} ${color} border-transparent active:scale-95`
                : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-60"
              }`}
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-xs font-semibold">{label}</span>
            {!isReady && (
              <span className="text-[10px] font-mono leading-none opacity-80">
                {formatCooldown(cd)}
              </span>
            )}
            {isReady && <span className="text-[10px] leading-none opacity-60">Ready!</span>}
          </button>
        );
      })}
    </div>
  );
}
