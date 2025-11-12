import { useEffect, useState } from "react";
import { Heart, Sparkles, Battery, Droplets, Activity, Apple, Moon, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Pet } from "@shared/schema";
import { EVOLUTION_STAGES, XP_PER_LEVEL } from "@shared/schema";

interface PetDisplayProps {
  pet: Pet;
  size?: "small" | "medium" | "large";
  showStats?: boolean;
  showXP?: boolean;
}

interface StageConfig {
  bodySize: number;
  bodyY: number;
  armWidth: number;
  armHeight: number;
  armY: number;
  legWidth: number;
  legHeight: number;
  legY: number;
  headDecoration: {
    type: "circle" | "horns" | "crest" | "crown";
    size: number;
  };
  accentColor: string;
  bounceAmplitude: number;
}

const STAGE_CONFIGS: Record<number, StageConfig> = {
  0: { // Baby
    bodySize: 40,
    bodyY: 30,
    armWidth: 10,
    armHeight: 15,
    armY: 45,
    legWidth: 10,
    legHeight: 20,
    legY: 70,
    headDecoration: { type: "circle", size: 8 },
    accentColor: "hsl(var(--accent))",
    bounceAmplitude: 10,
  },
  1: { // Child
    bodySize: 45,
    bodyY: 28,
    armWidth: 11,
    armHeight: 18,
    armY: 43,
    legWidth: 11,
    legHeight: 23,
    legY: 69,
    headDecoration: { type: "horns", size: 6 },
    accentColor: "hsl(var(--chart-2))",
    bounceAmplitude: 12,
  },
  2: { // Teen
    bodySize: 50,
    bodyY: 25,
    armWidth: 12,
    armHeight: 20,
    armY: 40,
    legWidth: 12,
    legHeight: 26,
    legY: 68,
    headDecoration: { type: "crest", size: 10 },
    accentColor: "hsl(var(--chart-3))",
    bounceAmplitude: 14,
  },
  3: { // Adult
    bodySize: 55,
    bodyY: 22,
    armWidth: 13,
    armHeight: 22,
    armY: 38,
    legWidth: 13,
    legHeight: 28,
    legY: 67,
    headDecoration: { type: "crown", size: 12 },
    accentColor: "hsl(var(--chart-4))",
    bounceAmplitude: 16,
  },
};

export default function PetDisplay({ 
  pet, 
  size = "medium", 
  showStats = true,
  showXP = true
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
    if (pet.isSick) return "sick";
    if (pet.hunger < 40 || pet.happiness < 40) return "sad";
    if (pet.cleanliness < 40) return "dirty";
    const avgStat = (pet.hunger + pet.happiness + pet.energy + pet.cleanliness + (pet.health ?? 100)) / 5;
    if (avgStat >= 70) return "happy";
    return "neutral";
  };

  const isDirty = pet.cleanliness < 40;
  const isHungry = pet.hunger < 40;
  const isTired = pet.energy < 40;
  const isSick = pet.isSick || false;

  const mood = getPetMood();
  const stageConfig = STAGE_CONFIGS[pet.evolutionStage] || STAGE_CONFIGS[0];

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

  const renderHeadDecoration = () => {
    const { headDecoration } = stageConfig;
    const headY = stageConfig.bodyY - 5;
    
    switch (headDecoration.type) {
      case "circle":
        return <circle cx="50" cy={headY} r={headDecoration.size} fill={stageConfig.accentColor} opacity="0.8" />;
      case "horns":
        return (
          <>
            <circle cx="38" cy={headY} r={headDecoration.size} fill={stageConfig.accentColor} opacity="0.8" />
            <circle cx="62" cy={headY} r={headDecoration.size} fill={stageConfig.accentColor} opacity="0.8" />
          </>
        );
      case "crest":
        return (
          <>
            <circle cx="42" cy={headY - 2} r={headDecoration.size * 0.6} fill={stageConfig.accentColor} opacity="0.9" />
            <circle cx="50" cy={headY - 4} r={headDecoration.size} fill={stageConfig.accentColor} opacity="0.9" />
            <circle cx="58" cy={headY - 2} r={headDecoration.size * 0.6} fill={stageConfig.accentColor} opacity="0.9" />
          </>
        );
      case "crown":
        return (
          <>
            <rect x="35" y={headY - 8} width="30" height="3" fill={stageConfig.accentColor} opacity="0.9" />
            <circle cx="40" cy={headY - 10} r={headDecoration.size * 0.5} fill={stageConfig.accentColor} />
            <circle cx="50" cy={headY - 12} r={headDecoration.size * 0.6} fill={stageConfig.accentColor} />
            <circle cx="60" cy={headY - 10} r={headDecoration.size * 0.5} fill={stageConfig.accentColor} />
          </>
        );
    }
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

  const xpProgress = (pet.xp / XP_PER_LEVEL) * 100;
  const stageName = EVOLUTION_STAGES[pet.evolutionStage as keyof typeof EVOLUTION_STAGES] || "Baby";

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
        <div className="flex items-center gap-2 justify-center flex-wrap">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-chart-4" />
            <span className="text-sm font-semibold" data-testid="text-pet-level">Level {pet.level}</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-muted-foreground" data-testid="text-pet-stage">{stageName}</span>
          </div>
        </div>
      </div>

      <div 
        className={`relative ${sizeClasses[size]}`}
        data-testid="button-pet-interact"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full pixelated"
          style={{ 
            imageRendering: "pixelated",
            animation: `bounce ${2 + pet.evolutionStage * 0.2}s ease-in-out infinite`
          }}
          data-testid="img-pet"
        >
          <g className={isSick ? "sick-overlay" : isDirty ? "dirty-overlay" : ""}>
            {/* Main body */}
            <rect 
              x={(100 - stageConfig.bodySize) / 2} 
              y={stageConfig.bodyY} 
              width={stageConfig.bodySize} 
              height={stageConfig.bodySize} 
              fill="hsl(var(--primary))" 
              rx="8" 
            />
            
            {/* Arms */}
            <rect 
              x={((100 - stageConfig.bodySize) / 2) - stageConfig.armWidth - 5} 
              y={stageConfig.armY} 
              width={stageConfig.armWidth} 
              height={stageConfig.armHeight} 
              fill="hsl(var(--primary))" 
              rx="3" 
            />
            <rect 
              x={((100 - stageConfig.bodySize) / 2) + stageConfig.bodySize + 5} 
              y={stageConfig.armY} 
              width={stageConfig.armWidth} 
              height={stageConfig.armHeight} 
              fill="hsl(var(--primary))" 
              rx="3" 
            />
            
            {/* Legs */}
            <rect 
              x={((100 - stageConfig.bodySize) / 2) + stageConfig.bodySize * 0.2} 
              y={stageConfig.legY} 
              width={stageConfig.legWidth} 
              height={stageConfig.legHeight} 
              fill="hsl(var(--primary))" 
              rx="3" 
            />
            <rect 
              x={((100 - stageConfig.bodySize) / 2) + stageConfig.bodySize * 0.7} 
              y={stageConfig.legY} 
              width={stageConfig.legWidth} 
              height={stageConfig.legHeight} 
              fill="hsl(var(--primary))" 
              rx="3" 
            />
            
            {/* Eyes */}
            {blinkState ? (
              <>
                <line x1="40" y1={stageConfig.bodyY + 15} x2="45" y2={stageConfig.bodyY + 15} stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
                <line x1="55" y1={stageConfig.bodyY + 15} x2="60" y2={stageConfig.bodyY + 15} stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
              </>
            ) : (
              <>
                <circle cx="42" cy={stageConfig.bodyY + 15} r="3" fill="hsl(var(--primary-foreground))" />
                <circle cx="58" cy={stageConfig.bodyY + 15} r="3" fill="hsl(var(--primary-foreground))" />
              </>
            )}
            
            {/* Mouth based on mood */}
            {mood === "happy" && (
              <path d={`M 40 ${stageConfig.bodyY + 25} Q 50 ${stageConfig.bodyY + 30} 60 ${stageConfig.bodyY + 25}`} stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" />
            )}
            {mood === "neutral" && (
              <line x1="40" y1={stageConfig.bodyY + 25} x2="60" y2={stageConfig.bodyY + 25} stroke="hsl(var(--primary-foreground))" strokeWidth="2" />
            )}
            {(mood === "sad" || mood === "dirty") && (
              <path d={`M 40 ${stageConfig.bodyY + 28} Q 50 ${stageConfig.bodyY + 23} 60 ${stageConfig.bodyY + 28}`} stroke="hsl(var(--primary-foreground))" strokeWidth="2" fill="none" />
            )}
            {mood === "sick" && (
              <>
                <circle cx="50" cy={stageConfig.bodyY + 26} r="2" fill="hsl(var(--primary-foreground))" />
                <line x1="42" y1={stageConfig.bodyY + 25} x2="47" y2={stageConfig.bodyY + 25} stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" />
                <line x1="53" y1={stageConfig.bodyY + 25} x2="58" y2={stageConfig.bodyY + 25} stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" />
              </>
            )}
            
            {/* Head decoration */}
            {renderHeadDecoration()}
          </g>
          
          {isDirty && (
            <>
              <circle cx="35" cy="35" r="2" fill="hsl(var(--muted-foreground))" opacity="0.6" />
              <circle cx="65" cy="40" r="2" fill="hsl(var(--muted-foreground))" opacity="0.6" />
              <circle cx="45" cy="68" r="2" fill="hsl(var(--muted-foreground))" opacity="0.6" />
            </>
          )}
        </svg>

        {isSick && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-destructive/90 rounded-full p-1.5 float-animation pulse-animation" data-testid="indicator-sick">
            <Thermometer className="w-5 h-5 text-destructive-foreground" />
          </div>
        )}

        {isHungry && !isSick && (
          <div className="absolute -top-2 -right-2 bg-destructive/90 rounded-full p-1.5 float-animation" data-testid="indicator-hungry">
            <Apple className="w-4 h-4 text-destructive-foreground" />
          </div>
        )}
        
        {isTired && !isSick && (
          <div className="absolute -top-2 -left-2 bg-muted/90 rounded-full p-1.5 float-animation" style={{ animationDelay: "0.5s" }} data-testid="indicator-tired">
            <Moon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground capitalize" data-testid="text-pet-mood">
        Feeling {mood}
      </p>

      {showXP && (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">XP Progress</span>
            <span className="font-medium">{pet.xp}/{XP_PER_LEVEL}</span>
          </div>
          <Progress value={xpProgress} className="h-2" data-testid="progress-xp" />
        </div>
      )}

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

        .sick-overlay {
          filter: brightness(0.7) saturate(0.4) hue-rotate(180deg);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }

        .pulse-animation {
          animation: pulse 1.5s ease-in-out infinite;
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
