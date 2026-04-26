import { useState, useEffect, useCallback } from "react";
import { Utensils, Dumbbell, Sparkles, BedDouble } from "lucide-react";
import type { Pet, ActionType } from "@/lib/gameStorage";
import { getCooldownRemaining, formatCooldown } from "@/lib/gameStorage";

interface ActionButtonsProps {
  pet: Pet;
  onAction: (action: ActionType) => void;
  disabled?: boolean;
  showHints?: boolean;
}

const ACTIONS: {
  id: ActionType;
  label: string;
  icon: typeof Utensils;
  color: string;
  bg: string;
  countKey: keyof Pet;
  statLabel: string;
  cooldownLabel: string;
}[] = [
  { id: "feed",  label: "Feed",  icon: Utensils,  color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100", countKey: "feedCount",  statLabel: "+Hunger",  cooldownLabel: "5m cd"  },
  { id: "play",  label: "Play",  icon: Dumbbell,  color: "text-pink-600",   bg: "bg-pink-50 hover:bg-pink-100",     countKey: "playCount",  statLabel: "+Happy",   cooldownLabel: "3m cd"  },
  { id: "clean", label: "Clean", icon: Sparkles,  color: "text-blue-600",   bg: "bg-blue-50 hover:bg-blue-100",     countKey: "cleanCount", statLabel: "+Clean",   cooldownLabel: "10m cd" },
  { id: "sleep", label: "Sleep", icon: BedDouble, color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100", countKey: "sleepCount", statLabel: "+Energy",  cooldownLabel: "15m cd" },
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

export default function ActionButtons({ pet, onAction, disabled, showHints }: ActionButtonsProps) {
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

  // Find the first action that hasn't been used yet
  const firstHintAction = showHints
    ? (ACTIONS.find((a) => (pet[a.countKey] as number) === 0)?.id ?? null)
    : null;

  return (
    <div className="space-y-1.5">
      {/* Hint text for brand-new players */}
      {firstHintAction && (
        <p className="text-xs text-center text-muted-foreground" data-testid="action-hint-text">
          Tap <span className="font-semibold capitalize text-foreground">{firstHintAction}</span> to care for your pet!
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 w-full" data-testid="action-buttons">
        {ACTIONS.map(({ id, label, icon: Icon, color, bg, statLabel, cooldownLabel }) => {
          const cd = countdowns[id];
          const isReady = cd === 0;
          const isHint = firstHintAction === id;

          return (
            <div key={id} className="relative">
              {/* Pulsing hint ring */}
              {isHint && isReady && (
                <span
                  className="absolute inset-0 rounded-xl border-2 border-primary animate-ping opacity-40 pointer-events-none"
                  aria-hidden
                />
              )}

              <button
                onClick={() => handleAction(id)}
                disabled={!isReady || disabled}
                data-testid={`action-${id}`}
                title={`${label}: ${statLabel} | Cooldown: ${cooldownLabel}`}
                className={`w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition-all duration-150 cursor-pointer
                  ${isReady && !disabled
                    ? `${bg} ${color} border-transparent active:scale-95`
                    : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-60"
                  }`}
              >
                <Icon size={20} strokeWidth={2} />
                <span className="text-xs font-semibold">{label}</span>

                {/* Stat effect + cooldown info — always visible as tooltip-like sub-label */}
                {isReady ? (
                  isHint ? (
                    <span className="text-[9px] font-semibold text-primary leading-none">Tap me!</span>
                  ) : (
                    <span className="text-[9px] leading-none opacity-60">{statLabel}</span>
                  )
                ) : (
                  <span className="text-[9px] font-mono leading-none opacity-80">
                    {formatCooldown(cd)}
                  </span>
                )}

                {/* Cooldown label shown on ready state for context */}
                {isReady && (
                  <span className="text-[8px] leading-none opacity-40">{cooldownLabel}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
