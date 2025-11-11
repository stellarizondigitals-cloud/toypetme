import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Utensils, Gamepad2, Sparkles, Moon, Coins } from "lucide-react";
import { PET_ACTIONS } from "@shared/schema";
import type { Pet } from "@shared/schema";

function SparkleEffect({ show }: { show: boolean }) {
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `sparkle 1s ease-out ${i * 0.1}s`,
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
      ))}
      <style>{`
        @keyframes sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

interface ActionButtonsProps {
  pet: Pet;
  onFeed: () => void;
  onPlay: () => void;
  onClean: () => void;
  onSleep: () => void;
  isLoading?: boolean;
}

function getCooldownRemaining(lastActionTime: Date | null, cooldownMinutes: number): number {
  if (!lastActionTime) return 0;
  
  const now = Date.now();
  const lastAction = new Date(lastActionTime).getTime();
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const elapsedMs = now - lastAction;
  
  if (elapsedMs >= cooldownMs) return 0;
  
  return Math.ceil((cooldownMs - elapsedMs) / 1000);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ActionButtons({ pet, onFeed, onPlay, onClean, onSleep, isLoading }: ActionButtonsProps) {
  const [cooldowns, setCooldowns] = useState({
    feed: 0,
    play: 0,
    clean: 0,
  });
  const [showSparkles, setShowSparkles] = useState({
    feed: false,
    play: false,
    clean: false,
  });
  const prevTimestamps = useRef({
    lastFed: pet.lastFed,
    lastPlayed: pet.lastPlayed,
    lastCleaned: pet.lastCleaned,
  });

  useEffect(() => {
    const updateCooldowns = () => {
      setCooldowns({
        feed: getCooldownRemaining(pet.lastFed, PET_ACTIONS.feed.cooldownMinutes),
        play: getCooldownRemaining(pet.lastPlayed, PET_ACTIONS.play.cooldownMinutes),
        clean: getCooldownRemaining(pet.lastCleaned, PET_ACTIONS.clean.cooldownMinutes),
      });
    };

    updateCooldowns();
    const interval = setInterval(updateCooldowns, 1000);
    return () => clearInterval(interval);
  }, [pet.lastFed, pet.lastPlayed, pet.lastCleaned]);

  useEffect(() => {
    const prev = prevTimestamps.current;
    
    if (pet.lastFed && pet.lastFed !== prev.lastFed) {
      setShowSparkles(s => ({ ...s, feed: true }));
      setTimeout(() => setShowSparkles(s => ({ ...s, feed: false })), 1000);
    }
    if (pet.lastPlayed && pet.lastPlayed !== prev.lastPlayed) {
      setShowSparkles(s => ({ ...s, play: true }));
      setTimeout(() => setShowSparkles(s => ({ ...s, play: false })), 1000);
    }
    if (pet.lastCleaned && pet.lastCleaned !== prev.lastCleaned) {
      setShowSparkles(s => ({ ...s, clean: true }));
      setTimeout(() => setShowSparkles(s => ({ ...s, clean: false })), 1000);
    }

    prevTimestamps.current = {
      lastFed: pet.lastFed,
      lastPlayed: pet.lastPlayed,
      lastCleaned: pet.lastCleaned,
    };
  }, [pet.lastFed, pet.lastPlayed, pet.lastCleaned]);

  const actions = [
    { 
      icon: Utensils, 
      label: "Feed", 
      actionKey: "feed" as const,
      onClick: onFeed, 
      cooldown: cooldowns.feed,
      cost: PET_ACTIONS.feed.coinCost,
      testId: "button-feed",
      hasCooldown: true
    },
    { 
      icon: Gamepad2, 
      label: "Play", 
      actionKey: "play" as const,
      onClick: onPlay, 
      cooldown: cooldowns.play,
      cost: PET_ACTIONS.play.coinCost,
      testId: "button-play",
      hasCooldown: true
    },
    { 
      icon: Sparkles, 
      label: "Clean", 
      actionKey: "clean" as const,
      onClick: onClean, 
      cooldown: cooldowns.clean,
      cost: PET_ACTIONS.clean.coinCost,
      testId: "button-clean",
      hasCooldown: true
    },
    { 
      icon: Moon, 
      label: "Sleep", 
      actionKey: "feed" as const,
      onClick: onSleep, 
      cooldown: 0,
      cost: PET_ACTIONS.sleep.coinCost,
      testId: "button-sleep",
      hasCooldown: false
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const isOnCooldown = action.cooldown > 0;
        const disabled = isOnCooldown || isLoading;
        
        return (
          <Button
            key={action.label}
            variant={action.label === "Sleep" ? "secondary" : "default"}
            size="lg"
            className="h-16 gap-2 rounded-xl active-elevate-2 flex flex-col items-center justify-center relative overflow-hidden"
            onClick={action.onClick}
            disabled={disabled}
            data-testid={action.testId}
          >
            {action.hasCooldown && <SparkleEffect show={showSparkles[action.actionKey]} />}
            <div className="flex items-center gap-2">
              <action.icon className="w-5 h-5" />
              <span className="font-semibold">{action.label}</span>
            </div>
            {isOnCooldown && action.hasCooldown ? (
              <span className="text-xs opacity-80" data-testid={`${action.testId}-cooldown`}>
                {formatTime(action.cooldown)}
              </span>
            ) : action.cost > 0 ? (
              <div className="flex items-center gap-1 text-xs opacity-80">
                <Coins className="w-3 h-3" />
                <span data-testid={`${action.testId}-cost`}>{action.cost}</span>
              </div>
            ) : (
              <span className="text-xs opacity-80">Free</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
