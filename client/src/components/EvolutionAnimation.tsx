import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Trophy } from "lucide-react";
import { EVOLUTION_STAGES } from "@shared/schema";

interface EvolutionAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
  newStage: number;
  newLevel: number;
}

export default function EvolutionAnimation({
  isOpen,
  onClose,
  petName,
  newStage,
  newLevel,
}: EvolutionAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const stageName = EVOLUTION_STAGES[newStage as keyof typeof EVOLUTION_STAGES] || "Baby";

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-evolution">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-chart-4" />
            Evolution!
            <Trophy className="w-6 h-6 text-chart-4" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative">
            <div className="evolution-glow-animation">
              <Sparkles className="w-24 h-24 text-chart-4" />
            </div>
            {showConfetti && (
              <div className="confetti-container">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="confetti"
                    style={{
                      left: `${50 + (Math.random() - 0.5) * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      backgroundColor: [
                        "hsl(var(--chart-1))",
                        "hsl(var(--chart-2))",
                        "hsl(var(--chart-3))",
                        "hsl(var(--chart-4))",
                        "hsl(var(--primary))",
                      ][Math.floor(Math.random() * 5)],
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold" data-testid="text-evolution-message">
              Congratulations! {petName} evolved!
            </p>
            <p className="text-3xl font-bold text-primary" data-testid="text-evolution-stage">
              {stageName}
            </p>
            <p className="text-sm text-muted-foreground">
              Reached level {newLevel}
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-4 w-full text-center">
            <p className="text-sm text-muted-foreground">
              Your pet has grown stronger and gained new abilities!
            </p>
          </div>
        </div>

        <style>{`
          @keyframes evolutionGlow {
            0%, 100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
            50% {
              transform: scale(1.2) rotate(180deg);
              opacity: 0.8;
            }
          }

          .evolution-glow-animation {
            animation: evolutionGlow 2s ease-in-out infinite;
          }

          .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 200px;
            pointer-events: none;
          }

          @keyframes confettiFall {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(200px) rotate(720deg);
              opacity: 0;
            }
          }

          .confetti {
            position: absolute;
            width: 8px;
            height: 8px;
            animation: confettiFall 2s ease-in forwards;
            border-radius: 2px;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
