import { useEffect, useState } from "react";
import { Heart, Sparkles, Battery, Droplets, Activity, Apple, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Pet } from "@shared/schema";

interface PetDisplayProps {
  pet: Pet;
  size?: "small" | "medium" | "large";
  showStats?: boolean;
}

export default function PetDisplay({ 
  pet, 
  size = "medium", 
  showStats = true 
}: PetDisplayProps) {
  const [blinkState, setBlinkState] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const getPetMood = () => {
    if (pet.hunger < 40 || pet.happiness < 40) return "sad";
    if (pet.cleanliness < 40) return "dirty";
    const avgStat = (pet.hunger + pet.happiness + pet.energy + pet.cleanliness + (pet.health ?? 100)) / 5;
    if (avgStat >= 70) return "happy";
    return "neutral";
  };

  const isDirty = pet.cleanliness < 40;
  const isHungry = pet.hunger < 40;
  const isTired = pet.energy < 40;

  const mood = getPetMood();

  const sizeClasses = {
    small: "w-24 h-24",
    medium: "w-48 h-48",
    large: "w-64 h-64"
  };

  const getStatColor = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const statIcons = {
    hunger: Heart,
    happiness: Sparkles,
    energy: Battery,
    cleanliness: Droplets,
    health: Activity
  };

  const stats = [
    { name: "Hunger", value: pet.hunger, icon: statIcons.hunger },
    { name: "Happiness", value: pet.happiness, icon: statIcons.happiness },
    { name: "Energy", value: pet.energy, icon: statIcons.energy },
    { name: "Cleanliness", value: pet.cleanliness, icon: statIcons.cleanliness },
    { name: "Health", value: pet.health ?? 100, icon: statIcons.health },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-center">
        <h2 
          className="text-3xl font-bold text-primary mb-1" 
          style={{ fontFamily: 'Outfit, sans-serif' }}
          data-testid="text-pet-name"
        >
          {pet.name}
        </h2>
        <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full">
          <Sparkles className="w-4 h-4 text-chart-4" />
          <span className="text-sm font-semibold" data-testid="text-pet-level">Level {pet.level}</span>
        </div>
      </div>

      <div 
        className={`relative ${sizeClasses[size]}`}
        data-testid="button-pet-interact"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full pixelated bounce-animation"
          style={{ imageRendering: "pixelated" }}
          data-testid="img-pet"
        >
          <g className={isDirty ? "dirty-overlay" : ""}>
            <rect x="30" y="30" width="40" height="40" fill="hsl(var(--primary))" rx="8" />
            
            <rect x="25" y="45" width="10" height="15" fill="hsl(var(--primary))" rx="3" />
            <rect x="65" y="45" width="10" height="15" fill="hsl(var(--primary))" rx="3" />
            
            <rect x="35" y="70" width="10" height="20" fill="hsl(var(--primary))" rx="3" />
            <rect x="55" y="70" width="10" height="20" fill="hsl(var(--primary))" rx="3" />
            
            {blinkState ? (
              <>
                <line x1="40" y1="45" x2="45" y2="45" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
                <line x1="55" y1="45" x2="60" y2="45" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
              </>
            ) : (
              <>
                <circle cx="42" cy="45" r="3" fill="hsl(var(--primary-foreground))" />
                <circle cx="58" cy="45" r="3" fill="hsl(var(--primary-foreground))" />
              </>
            )}
            
            {mood === "happy" && (
              <path d="M 40 55 Q 50 60 60 55" stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" />
            )}
            {mood === "neutral" && (
              <line x1="40" y1="55" x2="60" y2="55" stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
            )}
            {(mood === "sad" || mood === "dirty") && (
              <path d="M 40 58 Q 50 53 60 58" stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" />
            )}
            
            <circle cx="50" cy="25" r="8" fill="hsl(var(--accent))" opacity="0.8" />
          </g>
          
          {isDirty && (
            <>
              <circle cx="35" cy="35" r="2" fill="hsl(var(--muted-foreground))" opacity="0.6" />
              <circle cx="65" cy="40" r="2" fill="hsl(var(--muted-foreground))" opacity="0.6" />
              <circle cx="45" cy="68" r="2" fill="hsl(var(--muted-foreground))" opacity="0.6" />
            </>
          )}
        </svg>

        {isHungry && (
          <div className="absolute -top-2 -right-2 bg-destructive/90 rounded-full p-1.5 float-animation" data-testid="indicator-hungry">
            <Apple className="w-4 h-4 text-destructive-foreground" />
          </div>
        )}
        
        {isTired && (
          <div className="absolute -top-2 -left-2 bg-muted/90 rounded-full p-1.5 float-animation" style={{ animationDelay: "0.5s" }} data-testid="indicator-tired">
            <Moon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground capitalize" data-testid="text-pet-mood">
        Feeling {mood}
      </p>

      {showStats && (
        <Card className="w-full p-4 space-y-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{stat.name}</span>
                  </div>
                  <span className="text-muted-foreground">{stat.value}%</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 ${getStatColor(stat.value)} rounded-full transition-all duration-500 progress-fill-animation`}
                    style={{ width: `${stat.value}%` }}
                    data-testid={`progress-${stat.name.toLowerCase()}`}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <style>{`
        .pixelated {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .bounce-animation {
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-8px) scale(1.1);
            opacity: 0.9;
          }
        }

        .float-animation {
          animation: float 2s ease-in-out infinite;
        }

        .dirty-overlay {
          filter: brightness(0.85) saturate(0.8);
        }

        @keyframes progress-fill {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        .progress-fill-animation {
          transform-origin: left;
          animation: progress-fill 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
